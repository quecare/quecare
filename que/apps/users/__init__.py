from flask import Blueprint, request, render_template, redirect, url_for, jsonify
from flask_login import login_user, login_required, current_user, logout_user
from passlib.apps import custom_app_context as pwd_context

import forms
from que import db
from que.apps.users.models import physicians

users_app = Blueprint('users', __name__)


@users_app.route('/register', methods=['GET', 'POST'])
def register_physician():
    registration_form = forms.UserRegistrationForm(csrf_enabled=False)
    if request.method == 'POST' and registration_form.validate():
        physician_data = registration_form.data
        physician_data['password'] = pwd_context.encrypt(registration_form.password.data)
        physicians_model = physicians.PhysicianCollection(db.mongo.Physicians)
        physician_data['_id'] = physicians_model.insert(physician_data)

        login_user(physicians.PhysicianModel(physician_data))
        return redirect(url_for('.dashboard'))
    return render_template('register.html', form=registration_form)


@users_app.route('/login', methods=['GET', 'POST'])
def login_physician():
    if current_user.is_authenticated:
        return redirect(url_for('.dashboard'))
    login_form = forms.UserLoginForm(csrf_enabled=False)
    if request.method == 'POST' and login_form.validate():
        login_user(physicians.PhysicianModel(login_form.physician))

        return redirect(url_for('.dashboard'))
    return render_template('login.html', form=login_form)


@users_app.route('/get-auth-token', methods=['GET'])
@login_required
def get_auth_token():
    token = current_user.generate_auth_token()
    return jsonify({'token': token.decode('ascii')})


@users_app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')


@users_app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('.login_physician'))
