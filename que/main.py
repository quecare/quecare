from flask import render_template
from flask_login import LoginManager

import db
from que import flask_app
from apps import users, appointments, discussions, assets
from apps.users.models import physicians
from twilio import access_token
from werkzeug.utils import redirect

flask_app.register_blueprint(users.users_app)
flask_app.register_blueprint(appointments.appointment_app)
flask_app.register_blueprint(discussions.discussion_app)
flask_app.register_blueprint(assets.assets_app)

login_manager = LoginManager()
login_manager.init_app(flask_app)
login_manager.login_view = 'users.login_physician'
login_manager.login_message = 'Please login to access page'


@login_manager.user_loader
def load_user(physician_id):
    return physicians.PhysicianModel.get_physician(physician_id)


@flask_app.route('/')
def index():
    return render_template('index.html')


@flask_app.route('/<string:username>')
def load_physician(username):
    physician_model = physicians.PhysicianCollection(db.mongo.Physicians)
    physician = physician_model.find_one({'username': username})
    if physician:
        return render_template('physician.html', physician=physician)
    else:
        return render_template('404.html'), 404


@flask_app.route('/twilio-token')
def twilio_token():
    access_token.AccessToken(account_sid='AC422e668bb39d729d60db26ba8ca21a44',
                             )


if __name__ == '__main__':
    flask_app.run()
