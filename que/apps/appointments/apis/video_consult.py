from datetime import datetime

from flask_restful import fields, marshal_with, reqparse, Resource

from que import db
from que.utils import api_base, extra_fields
from que.apps.appointments.models import video_consults

video_consult_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'fullname': fields.String,
                        'email': fields.String, 'phone_number': fields.String, 'appointment': fields.String,
                        'date_for': fields.DateTime, 'date_chosen': fields.DateTime, 'room_name': fields.String,
                        'date_last_modified': fields.DateTime}


class VideoConsultsApi(api_base.ApiBase):
    @marshal_with(video_consult_fields, envelope='data')
    def get(self, physician_id):
        video_consult_model = video_consults.VideoConsultsCollection(db.mongo.VideoConsults)
        return [video_consult for video_consult in video_consult_model.find({'physician': physician_id})]


class ClientsVideoConsultsApi(Resource):
    @marshal_with(video_consult_fields)
    def post(self, physician_id):
        parser = reqparse.RequestParser()
        parser.add_argument('fullname', type=str, required=True)
        parser.add_argument('email', type=str, required=True)
        parser.add_argument('phone_number', type=str, required=True)
        parser.add_argument('appointment', type=str, required=True)
        parser.add_argument('hour', type=str, required=True)
        parser.add_argument('date_for', type=str, required=True)
        parser.add_argument('room_name', type=str, required=True)
        args = parser.parse_args()
        args['physician'] = physician_id
        args['date_for'] = datetime.strptime(args['date_for'], '%Y-%m-%d %H:%M:%S')
        video_consult_model = video_consults.VideoConsultsCollection(db.mongo.VideoConsults)
        args['date_chosen'] = args['date_last_modified'] = datetime.now()
        args['_id'] = video_consult_model.insert(args)
        return args
