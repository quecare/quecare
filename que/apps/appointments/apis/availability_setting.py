from datetime import datetime

from bson import ObjectId
from flask_restful import fields, marshal_with, reqparse, abort, Resource

from que import db
from que.utils import api_base, extra_fields
from que.apps.appointments.models import availability_settings

availability_setting_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                               'hours': fields.List(fields.String, default=[]),
                               'repeat_weekly': fields.Boolean(default=False),
                               'date_added': fields.DateTime, 'date_last_modified': fields.DateTime}

hours_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'title': fields.String,
                'start_time': fields.Nested({'hour': fields.Integer, 'minutes': fields.Integer}),
                'end_time': fields.Nested({'hour': fields.Integer, 'minutes': fields.Integer})}

hour_field = extra_fields.ObjectIdToData(db.mongo, 'Hours', ('id', 'title', 'start_time', 'end_time'))
availability_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                       'hours': fields.List(fields.Nested(hours_fields), default=[])}


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
            elif key == 'hours':
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
        availabilities = availability_setting.find({'physician': physician_id})
        availabilities_data = []
        hour_model = availability_settings.HoursCollection(db.mongo.Hours)
        for availability in availabilities:
            hour_ids = availability.get('hours')
            if hour_ids:
                hours = []
                for hour_id in hour_ids:
                    hour = hour_model.find_one({'_id': ObjectId(hour_id)})
                    hours.append(hour)
                availability['hours'] = hours
            availabilities_data.append(availability)
        return availabilities_data
