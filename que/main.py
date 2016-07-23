from flask import render_template
from flask_login import LoginManager

from que import flask_app
from apps import users
from apps.users.models import physicians


flask_app.register_blueprint(users.users_app)

login_manager = LoginManager()
login_manager.init_app(flask_app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please login to access page'


@login_manager.user_loader
def load_user(physician_id):
    return physicians.PhysicianModel.get_physician(physician_id)


@flask_app.route('/')
def index():
    return render_template('index.html')


@flask_app.route('/<string:username>')
def load_page(username):
    pass


if __name__ == '__main__':
    flask_app.run()
