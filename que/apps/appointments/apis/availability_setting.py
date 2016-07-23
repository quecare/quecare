from datetime import datetime

import pymongo

from bson import ObjectId
from flask_restful import fields, marshal_with, reqparse, abort, Resource

from que import db
from que.utils import api_base, extra_fields
from que.apps.appointments.models import availability_settings
from que.apps.appointments.models import video_consults

availability_setting_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                               'hours': fields.List(fields.String), 'repeat_weekly': fields.Boolean,
                               'date_added': fields.DateTime, 'date_last_modified': fields.DateTime}

hours_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'title': fields.String, 'start_time': fields.DateTime,
                'end_time': fields.DateTime}

availability_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                       'hours': fields.List(fields.Nested(hours_fields))}


class HoursApi(Resource):
    @marshal_with(hours_fields, envelope='data')
    def get(self):
        hours = availability_settings.HoursCollection(db.mongo.Hours)
        return [hour for hour in hours.find()]


class AvailabilitySettingsApi(api_base.ApiBase):
    @marshal_with(availability_setting_fields, envelope='data')
    def get(self, physician_id):
        availability_setting = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
        settings = availability_setting.find({'physician': physician_id})
        return [setting for setting in settings]

    @marshal_with(availability_setting_fields)
    def post(self, physician_id):
        parser = reqparse.RequestParser()
        parser.add_argument('day', type=str, required=True)
        parser.add_argument('hours', action='append', required=True)
        parser.add_argument('repeat_weekly', type=bool, required=False)
        args = parser.parse_args()
        availability_setting = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
        args['physician'] = physician_id
        args['day'] = args['day'].lower()
        args['date_added'] = args['date_last_modified'] = datetime.now()
        if availability_setting.find_one({'day': args['day'].lower()}):
            abort(400, message='\'%s\' settings already created' % args['day'])
        args['_id'] = availability_setting.insert(args)
        return args

    @marshal_with(availability_setting_fields)
    def put(self, physician_id, setting_id):
        setting_id = ObjectId(setting_id)
        parser = reqparse.RequestParser()
        parser.add_argument('hours', action='append', required=False)
        parser.add_argument('repeat_weekly', type=bool, required=False)
        request_args = parser.parse_args()
        args = {}
        for key, value in request_args.iteritems():
            if value is not None:
                args.update({key: value})
        availability_setting = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
        args['date_last_modified'] = datetime.now()
        result = availability_setting.update_one({'_id': setting_id, 'physician': physician_id}, {'$set': args})
        if result.matched_count == 0:
            abort(400, message='Invalid availability settings')
        return availability_setting.find_one({'_id': setting_id})


class AvailabilityApi(Resource):
    @marshal_with(availability_fields)
    def get(self, physician_id):
        availability_setting = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
        current_date = datetime.now()
        video_consult = video_consults.VideoConsultsCollection(db.mongo.VideoConsults)
        hours = availability_settings.HoursCollection(db.mongo.Hours)
        availability = availability_setting.find_one({'physician': physician_id,
                                                      'day': current_date.strftime('%A').lower()})
        if availability:
            returned_hours = []
            for hour in availability['hours']:
                hour_data = hours.find_by_id(ObjectId(hour))
                current_time = datetime.now()

                consult = (video_consult.find({'physician': physician_id, 'appointment': str(availability['_id']),
                                               'hour': hour, 'date_for': {'$gt': current_time}})
                           .sort('date_chosen', pymongo.DESCENDING).limit(1))
                if consult.count() > 0:
                    continue

                hour_data['start_time'] = current_time.replace(hour=hour_data['start_time'].hour, minute=0, second=0)
                hour_data['end_time'] = current_time.replace(hour=hour_data['end_time'].hour, minute=0, second=0)
                returned_hours.append(hour_data)
            return {'_id': availability['_id'], 'day': availability['day'], 'hours': returned_hours}
        else:
            return
