from bson import ObjectId
from flask_restful import fields, marshal_with, reqparse, url_for

from que import db, background_tasks
from que import utils
from que.utils import api_base, extra_fields, token_utils
from que.apps.discussions.models import answers, questions

answer_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'question': fields.String, 'answer': fields.String,
                 'read': fields.Boolean, 'entered_by': fields.String, 'date_answered': fields.DateTime,
                 'date_last_modified': fields.DateTime}


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
        args['entered_by'] = 'physician'
        args['read'] = False
        args['date_answered'] = args['date_last_modified'] = utils.get_date()
        args['_id'] = answer_model.insert(args)
        token = token_utils.generate_confirmation_token(question_id, expires_in=2629743.83)
        discussion_url = url_for('discussions.handle_discussion', token=token, _external=True)
        question_model = questions.QuestionsCollection(db.mongo.Questions)
        question = question_model.find_one({'_id': ObjectId(question_id)})
        background_tasks.notify_on_answer.delay(question['fullname'], question['email'], discussion_url)
        return args

    @marshal_with(answer_fields)
    def put(self, question_id, answer_id):
        answer_id = ObjectId(answer_id)
        answer_model = answers.AnswersCollection(db.mongo.Answers)
        answer_model.update_one({'_id': answer_id, 'question': question_id},
                                {'$set': {'read': True, 'date_last_modified': utils.get_date()}})
        return answer_model.find_one({'_id': answer_id})
