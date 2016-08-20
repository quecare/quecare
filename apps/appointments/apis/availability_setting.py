import pytz
from dateutil import parser as dateparser

from bson import ObjectId
from flask_restful import fields, marshal_with, reqparse, abort, Resource

from db import mongo
from utils import api_base, extra_fields, get_date

locale_tz = pytz.timezone('Africa/Lagos')
availability_setting_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                               'availability_times': fields.List(
                                   fields.Nested({'id': fields.String, 'title': fields.String,
                                                  'start_time': fields.DateTime, 'end_time': fields.DateTime}),
                                   default=[]), 'repeat_weekly': fields.Boolean(default=False),
                               'date_added': fields.DateTime, 'date_last_modified': fields.DateTime}

availability_time_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'title': fields.String,
                            'start_time': fields.DateTime, 'end_time': fields.DateTime}

availability_times_fields = {'id': fields.String, 'title': fields.String, 'start_time': fields.DateTime,
                             'end_time': fields.DateTime}

availability_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'day': fields.String,
                       'availability_times': fields.List(fields.Nested(availability_times_fields), default=[])}


class AvailabilityTimesApi(Resource):
    @marshal_with(availability_time_fields, envelope='data')
    def get(self):
        processed_times = []
        for availability_time in mongo.db.AvailabilityTimes.find():
            availability_time['start_time'] = dateparser.parse(availability_time['start_time'], ignoretz=True)
            availability_time['end_time'] = dateparser.parse(availability_time['end_time'], ignoretz=True)
            processed_times.append(availability_time)
        return processed_times


class AvailabilitySettingsApi(api_base.ApiBase):
    @marshal_with(availability_setting_fields, envelope='data')
    def get(self, physician_id):
        settings = mongo.db.AvailabilitySettings.find({'physician': physician_id})
        return [setting for setting in settings]

    @marshal_with(availability_setting_fields)
    def put(self, physician_id, setting_id):
        setting_id = ObjectId(setting_id)
        parser = reqparse.RequestParser()
        parser.add_argument('availability_times', action='append', type=dict, required=False)
        parser.add_argument('repeat_weekly', type=bool, required=False)
        request_args = parser.parse_args()
        args = {}
        for key, value in request_args.iteritems():
            if key == 'availability_times' and value:
                for availability_time in value:
                    availability_time['start_time'] = get_date(dateparser.parse(availability_time['start_time'],
                                                                                ignoretz=True))
                    availability_time['end_time'] = get_date(dateparser.parse(availability_time['end_time'],
                                                                              ignoretz=True))
                args.update({key: value})
            elif key == 'availability_times' and not value:
                args.update({key: []})
            elif value:
                args.update({key: value})
        args['date_last_modified'] = get_date()
        result = mongo.db.AvailabilitySettings.update_one({'_id': setting_id, 'physician': physician_id},
                                                          {'$set': args})
        if result.matched_count == 0:
            abort(400, message='Invalid availability settings')

        return mongo.db.AvailabilitySettings.find_one({'_id': setting_id})


class AvailabilityApi(Resource):
    @marshal_with(availability_fields)
    def get(self, physician_id):
        availability_settings = mongo.db.AvailabilitySettings.find({'physician': physician_id})
        return [availability_setting for availability_setting in availability_settings]
