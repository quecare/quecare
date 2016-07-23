from flask import render_template
from que import flask_app
from apps import users

flask_app.register_blueprint(users.users_app)


@flask_app.route('/')
def index():
    return render_template('index.html')


@flask_app.route('/register')
def register():
    return render_template('register.html')


@flask_app.route('/login')
def login():
    return render_template('login.html')


@flask_app.route('/<string:username>')
def load_page(username):
    pass


if __name__ == '__main__':
    flask_app.run()
