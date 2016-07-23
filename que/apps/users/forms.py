from flask_wtf import Form
from wtforms import StringField
from wtforms import BooleanField
from wtforms import PasswordField
from wtforms import validators
from passlib.apps import custom_app_context as pwd_context
from wtforms.fields.html5 import EmailField

from que import db
from que.apps.users.models import physicians


class UserLoginForm(Form):
    unique_id = StringField('Email/Username',
                            [validators.DataRequired(message='Please enter your email/username')])
    password = PasswordField('Password', [validators.DataRequired(message='Please enter your password')])
    remember_me = BooleanField('Remember Me')

    def __init__(self, *args, **kwargs):
        super(UserLoginForm, self).__init__(*args, **kwargs)
        self.physician = None

    def validate(self):
        rv = Form.validate(self)
        if not rv:
            return False

        physicians_model = physicians.PhysicianCollection(db.mongo.Physicians)
        physician = physicians_model.find_one(
            {'$or': [{'email': self.unique_id.data}, {'username': self.unique_id.data}]})

        if not physician:
            self.unique_id.errors.append('User does not exist')
            return False

        if not pwd_context.verify(self.password.data, physician['password']):
            self.password.errors.append('Password incorrect')
            return False
        self.physician = physician
        return True


class UserRegistrationForm(Form):
    fullname = StringField('Full Name', [validators.DataRequired(message='Fullname is required')])
    username = StringField('Username', [validators.DataRequired(message='Enter your username')])
    email = StringField('Email', [validators.DataRequired(message='Email is required'),
                                  validators.Email(message='Email entered is invalid')])
    password = PasswordField('Password', [validators.DataRequired(message='Password is required'),
                                          validators.EqualTo('confirm_password', message='Password does not match')])
    confirm_password = PasswordField('Confirm Password', [validators.DataRequired()])

    def __init__(self, *args, **kwargs):
        super(UserRegistrationForm, self).__init__(*args, **kwargs)

    def validate(self):
        rv = Form.validate(self)
        if not rv:
            return False

        physician = physicians.PhysicianCollection(db.mongo.Physicians)
        if physician.find_one({'email': self.email.data}):
            self.email.errors.append('Email has been registered')
            return False

        physician = physicians.PhysicianCollection(db.mongo.Physicians)
        if physician.find_one({'username': self.username.data}):
            self.username.errors.append('Username has been registered')
            return False
        return True


class ForgotPasswordForm(Form):
    email = EmailField('Email', [validators.DataRequired()])

    def __init__(self, *args, **kwargs):
        super(ForgotPasswordForm, self).__init__(*args, **kwargs)

    def validate(self):
        rv = Form.validate(self)
        if not rv:
            return False

        client = mongo.db.Clients.find_one({'email': self.email.data})
        if not client:
            self.email.errors.append('Email does not exist')
            return False

        self.client = client
        return True


class ResetPasswordForm(Form):
    new_password = PasswordField('New Password', [validators.DataRequired(message='Password is required'),
                                                  validators.EqualTo('confirm_password',
                                                                     message='Password does not match')])
    confirm_password = PasswordField('Confirm Password', [validators.DataRequired()])

    def __init__(self, *args, **kwargs):
        super(ResetPasswordForm, self).__init__(*args, **kwargs)

    def validate(self):
        rv = Form.validate(self)
        if not rv:
            return False

        return True
