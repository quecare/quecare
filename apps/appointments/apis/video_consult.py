from datetime import timedelta
from dateutil import parser as dateparser

from flask import url_for
from flask_restful import fields, marshal_with, reqparse, Resource, abort
from bson import ObjectId

from db import mongo
import background_tasks
from utils import api_base, extra_fields, token_utils, get_date

video_consult_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'fullname': fields.String,
                        'email': fields.String, 'phone_number': fields.String, 'appointment': fields.String,
                        'date_for': fields.DateTime, 'date_chosen': fields.DateTime,
                        'physician': fields.String, 'date_last_modified': fields.DateTime}

video_consult_data_parser = reqparse.RequestParser()
video_consult_data_parser.add_argument('fullname', type=str, required=True)
video_consult_data_parser.add_argument('email', type=str, required=True)
video_consult_data_parser.add_argument('phone_number', type=str, required=True)
video_consult_data_parser.add_argument('appointment', type=str, required=True)
video_consult_data_parser.add_argument('start_date', type=str, required=True)
video_consult_data_parser.add_argument('end_date', type=str, required=True)


class VideoConsultsApi(api_base.ApiBase):
    @marshal_with(video_consult_fields, envelope='data')
    def get(self, physician_id):
        return [video_consult for video_consult in mongo.db.VideoConsults.find({'physician': physician_id})]


class ClientsVideoConsultsApi(Resource):
    @marshal_with(video_consult_fields)
    def get(self, consult_id):
        return mongo.db.VideoConsults.find_one({'_id': ObjectId(consult_id)})

    @marshal_with(video_consult_fields)
    def post(self, physician_id):
        args = video_consult_data_parser.parse_args()
        args['physician'] = physician_id
        args['start_date'] = start_date = dateparser.parse(args['start_date'])
        args['end_date'] = end_date = dateparser.parse(args['end_date'])

        if start_date <= get_date():
            abort(400, message='Invalid start date.')

        if end_date <= start_date:
            abort(400, message='Invalid end date.')

        video_consult = mongo.db.VideoConsults.find_one({'start_date': start_date})
        if video_consult:
            abort(400, message='Time already chosen.')

        args['date_chosen'] = args['date_last_modified'] = get_date()
        args['_id'] = mongo.db.VideoConsults.insert(args)

        token_expiry_date = (end_date + timedelta(minutes=5)) - start_date
        token = token_utils.generate_confirmation_token(str(args['_id']), expires_in=token_expiry_date.total_seconds())
        discussion_url = url_for('.appointment', appointment_token=token, _external=True)
        background_tasks.send_client_appointment_info.delay(args['fullname'], args['email'], discussion_url)
        return args
