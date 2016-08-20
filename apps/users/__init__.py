from flask import Blueprint, request, render_template, redirect, url_for, jsonify
from flask_login import login_user, login_required, current_user, logout_user
from passlib.apps import custom_app_context as pwd_context
from flask_restful import Api

import apis
import forms
import models
from db import mongo
import background_tasks
from utils import get_date

users_app = Blueprint('users', __name__)


@users_app.route('/register', methods=['GET', 'POST'])
def register_physician():
    registration_form = forms.UserRegistrationForm(csrf_enabled=False)
    if request.method == 'POST' and registration_form.validate():
        physician_data = registration_form.data
        physician_data['password'] = pwd_context.encrypt(registration_form.password.data)
        current_date = get_date()
        physician_data['date_registered'] = physician_data['date_updated'] = current_date
        physician_data['_id'] = physician_id = mongo.db.Physicians.insert(physician_data)

        background_tasks.create_availability_settings.delay(str(physician_id))

        login_user(models.Physician(physician_data))
        return redirect(url_for('.dashboard'))
    return render_template('register.html', form=registration_form)


@users_app.route('/login', methods=['GET', 'POST'])
def login_physician():
    if current_user.is_authenticated:
        return redirect(url_for('.dashboard'))
    login_form = forms.UserLoginForm(csrf_enabled=False)
    if request.method == 'POST' and login_form.validate():
        login_user(models.Physician(login_form.physician))

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


users_api = Api(users_app)
users_api.add_resource(apis.PhysicianApi, '/physicians/<string:physician_id>')
