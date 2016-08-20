from bson import ObjectId
from flask import url_for
from flask_restful import fields, marshal_with, reqparse, Resource

from db import mongo
import background_tasks
from utils import api_base, extra_fields, token_utils, get_date

question_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'email': fields.String, 'fullname': fields.String,
                   'phone_number': fields.String, 'question': fields.String, 'date_asked': fields.DateTime,
                   'read': fields.Boolean, 'date_last_modified': fields.DateTime}


class QuestionsApi(api_base.ApiBase):
    @marshal_with(question_fields, envelope='data')
    def get(self, physician_id):
        return [question for question in mongo.db.Questions.find({'physician': physician_id})]

    @marshal_with(question_fields)
    def put(self, physician_id, question_id):
        question_id = ObjectId(question_id)
        mongo.db.Questions.update_one({'_id': question_id, 'physician': physician_id},
                                      {'$set': {'read': True, 'date_last_modified': get_date()}})
        return mongo.db.Questions.find_one({'_id': question_id})


class ClientQuestionsApi(Resource):
    @marshal_with(question_fields)
    def post(self, physician_id):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True)
        parser.add_argument('question', type=str, required=True)
        parser.add_argument('fullname', type=str, required=True)
        parser.add_argument('phone_number', type=str, required=True)
        args = parser.parse_args()
        args['physician'] = physician_id
        args['read'] = False
        args['date_asked'] = args['date_last_modified'] = get_date()
        args['_id'] = mongo.db.Questions.insert(args)

        # token expires in 1 month.
        token = token_utils.generate_confirmation_token(str(args['_id']), expires_in=2629743.83)
        discussion_url = url_for('.handle_discussion', token=token, _external=True)
        background_tasks.send_client_discussion_info.delay(args['fullname'], args['email'], discussion_url)
        return args
