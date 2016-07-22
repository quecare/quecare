from flask import render_template
from que import flask_app
from apps import users

flask_app.register_blueprint(users.users_app)


@flask_app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    flask_app.run()
