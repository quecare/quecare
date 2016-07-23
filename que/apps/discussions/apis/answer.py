from datetime import datetime

from flask_restful import fields, marshal_with, reqparse

from que import db
from que.utils import api_base, extra_fields
from que.apps.discussions.models import answers

answer_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'question': fields.String, 'answer': fields.String,
                 'date_answered': fields.DateTime, 'date_last_modified': fields.DateTime}


class AnswersApi(api_base.ApiBase):
    @marshal_with(answer_fields, envelope='data')
    def get(self, question_id):
        answer_model = answers.AnswersCollection(db.mongo.Answers)
        return [answer for answer in answer_model.find({'question': question_id})]

    @marshal_with(answer_fields)
    def post(self, question_id):
        parser = reqparse.RequestParser()
        parser.add_argument('answer', type=str, required=True)
        args = parser.parse_args()
        answer_model = answers.AnswersCollection(db.mongo.Answers)
        args['question'] = question_id
        args['date_answered'] = args['date_last_modified'] = datetime.now()
        args['_id'] = answer_model.insert(args)
        return args
