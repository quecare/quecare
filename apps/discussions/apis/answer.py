from bson import ObjectId
from flask_restful import fields, marshal_with, reqparse, url_for

from db import mongo
import background_tasks
from utils import api_base, extra_fields, token_utils, get_date

answer_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'question': fields.String, 'answer': fields.String,
                 'read': fields.Boolean, 'entered_by': fields.String, 'date_answered': fields.DateTime,
                 'date_last_modified': fields.DateTime}


class AnswersApi(api_base.ApiBase):
    @marshal_with(answer_fields, envelope='data')
    def get(self, question_id):
        return [answer for answer in mongo.db.Answers.find({'question': question_id})]

    @marshal_with(answer_fields)
    def post(self, question_id):
        parser = reqparse.RequestParser()
        parser.add_argument('answer', type=str, required=True)
        args = parser.parse_args()
        args['question'] = question_id
        args['entered_by'] = 'physician'
        args['read'] = False
        args['date_answered'] = args['date_last_modified'] = get_date()
        args['_id'] = mongo.db.Answers.insert(args)
        token = token_utils.generate_confirmation_token(question_id, expires_in=2629743.83)
        discussion_url = url_for('discussions.handle_discussion', token=token, _external=True)
        question = mongo.db.Questions.find_one({'_id': ObjectId(question_id)})
        background_tasks.notify_on_answer.delay(question['fullname'], question['email'], discussion_url)
        return args

    @marshal_with(answer_fields)
    def put(self, question_id, answer_id):
        answer_id = ObjectId(answer_id)
        mongo.db.Answers.update_one({'_id': answer_id, 'question': question_id},
                                    {'$set': {'read': True, 'date_last_modified': get_date()}})
        return mongo.db.Answers.find_one({'_id': answer_id})
