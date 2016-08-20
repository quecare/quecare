from flask import render_template, jsonify, request
from flask_login import LoginManager
from twilio.access_token import AccessToken, ConversationsGrant
from bson import ObjectId

from db import mongo
import models
from app import flask_app
from apps import users, appointments, discussions

flask_app.register_blueprint(users.users_app)
flask_app.register_blueprint(appointments.appointment_app)
flask_app.register_blueprint(discussions.discussion_app)

login_manager = LoginManager()
login_manager.init_app(flask_app)
login_manager.login_view = 'users.login_physician'
login_manager.login_message = 'Please login to access page'


@login_manager.user_loader
def load_user(physician_id):
    return models.Physician(mongo.db.Physicians.find_one({'_id': ObjectId(physician_id)}))


@flask_app.route('/')
def index():
    domain = request.headers['host']
    if domain == 'docadesanya.com':
        physician = mongo.db.Physicians.find_one({'username': 'ade01'})
        if physician:
            return render_template('physician.html', physician=physician)
    return render_template('index.html')


@flask_app.route('/<string:username>')
def load_physician(username):
    physician = mongo.db.Physicians.find_one({'username': username})
    if physician:
        return render_template('physician.html', physician=physician)
    else:
        return render_template('404.html'), 404


@flask_app.route('/receive-event', methods=['POST'])
def receive_event():
    print request.json
    return 'ok'


@flask_app.route('/twilio-token/<string:name>')
def twilio_token(name):
    account_sid = 'ACf60ce38fa73542b8825e14c78259c009'
    api_key = 'SK4d27b90a36307ff377b995a88e6bf701'
    api_secret = 'hgA9nRO7dCapi8DzLV9DZpJgvm1hxlL9'
    token = AccessToken(account_sid=account_sid, signing_key_sid=api_key, secret=api_secret)
    token.identity = name
    grant = ConversationsGrant()
    grant.configuration_profile_sid = 'VSb199b7226ca07347d5fa4684831d67a4'
    token.add_grant(grant)
    return jsonify(identity=token.identity, token=token.to_jwt())


if __name__ == '__main__':
    flask_app.run()
