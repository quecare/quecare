import pymongo
from bson import ObjectId
from flask_restful import Resource, fields, marshal_with, reqparse

from que import db, utils
from que.utils import extra_fields
from que.apps.discussions.models import questions, answers

question_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'email': fields.String, 'fullname': fields.String,
                   'question': fields.String, 'date_asked': fields.DateTime, 'date_last_modified': fields.DateTime,
                   'answers': fields.List(fields.Nested({'id': extra_fields.ObjectIdStr(attribute='_id'),
                                                         'answer': fields.String, 'date_answered': fields.DateTime,
                                                         'entered_by': fields.String}))}
answer_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'),
                 'answer': fields.String, 'date_answered': fields.DateTime,
                 'entered_by': fields.String}


class DiscussionApi(Resource):
    @marshal_with(question_fields)
    def get(self, question_id):
        question_model = questions.QuestionsCollection(db.mongo.Questions)
        question = question_model.find_one({'_id': ObjectId(question_id)})
        if question:
            answer_model = answers.AnswersCollection(db.mongo.Answers)
            question.answers = [answer for answer in answer_model.find({'question': question_id})
                                                                 .sort('date_answered', pymongo.DESCENDING)]
        return question


class DiscussionAnswersApi(Resource):
    @marshal_with(answer_fields)
    def post(self, question_id):
        parser = reqparse.RequestParser()
        parser.add_argument('answer', required=True, type=str)
        args = parser.parse_args()
        args['question'] = question_id
        args['entered_by'] = 'client'
        args['date_answered'] = args['date_last_modified'] = utils.get_date()
        args['read'] = False
        answer_model = answers.AnswersCollection(db.mongo.Answers)
        args['_id'] = answer_model.insert(args)
        return args
