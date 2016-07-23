from datetime import datetime

from flask_restful import fields, marshal_with, reqparse, Resource

from que import db
from que.utils import api_base, extra_fields
from que.apps.discussions.models import questions

question_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'email': fields.String, 'fullname': fields.String,
                   'phone_number': fields.String, 'question': fields.String, 'date_asked': fields.DateTime,
                   'date_last_modified': fields.DateTime}


class QuestionsApi(api_base.ApiBase):
    @marshal_with(question_fields, envelope='data')
    def get(self, physician_id):
        question_model = questions.QuestionsCollection(db.mongo.Questions)
        return [question for question in question_model.find({'physician': physician_id})]


class ClientQuestionsApi(Resource):
    @marshal_with(question_fields)
    def post(self, physician_id):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True)
        parser.add_argument('question', type=str, required=True)
        parser.add_argument('fullname', type=str, required=True)
        parser.add_argument('phone_number', type=str, required=True)
        args = parser.parse_args()
        question_model = questions.QuestionsCollection(db.mongo.Questions)
        args['physician'] = physician_id
        args['date_asked'] = args['date_last_modified'] = datetime.now()
        args['_id'] = question_model.insert(args)
        return args
