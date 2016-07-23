from flask import Blueprint
from flask_restful import Api

import apis

discussion_app = Blueprint('discussions', __name__)
discussion_api = Api(discussion_app)

discussion_api.add_resource(apis.QuestionsApi, '/physicians/<string:physician_id>/questions')
discussion_api.add_resource(apis.ClientQuestionsApi, '/physicians/<string:physician_id>/questions')
discussion_api.add_resource(apis.AnswersApi, '/questions/<string:question_id>/answers')
