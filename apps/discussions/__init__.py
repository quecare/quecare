from flask import Blueprint, redirect, render_template
from flask_restful import Api
from bson import ObjectId

import apis
from db import mongo
from utils import token_utils

discussion_app = Blueprint('discussions', __name__)
discussion_api = Api(discussion_app)


@discussion_app.route('/discussion/<string:token>', methods=['GET'])
def handle_discussion(token):
    question_id = token_utils.verify_token(token)
    if question_id:
        question = mongo.db.Questions.find_one({'_id': ObjectId(question_id)})
        if question:
            physician = mongo.db.Physicians.find_one({'_id': ObjectId(question['physician'])})
            url = '/{}#/discussion/{}'.format(physician['username'], question['_id'])
            return redirect(url)
    return render_template('404.html'), 404


discussion_api.add_resource(apis.QuestionsApi, '/physicians/<string:physician_id>/questions',
                            '/physicians/<string:physician_id>/questions/<string:question_id>')
discussion_api.add_resource(apis.ClientQuestionsApi, '/physicians/<string:physician_id>/questions')
discussion_api.add_resource(apis.AnswersApi, '/questions/<string:question_id>/answers')
discussion_api.add_resource(apis.DiscussionApi, '/discussions/<string:question_id>')
discussion_api.add_resource(apis.DiscussionAnswersApi, '/discussions/<string:question_id>/answers')
