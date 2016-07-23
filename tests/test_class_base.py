import unittest

import simplejson as json

from que.main import flask_app
from que import db


class TestClassBase(unittest.TestCase):
    headers = {'Content-type': 'application/json'}

    def setUp(self):
        self.app = flask_app.test_client()
        self.login_physician()
        token = json.loads(self.get_auth_token().data)['token']
        self.headers['auth-token'] = token
        with flask_app.app_context():
            self.physician = db.mongo.Physicians.find_one({'email': 'testmail@domain.com'})

    def tearDown(self):
        with flask_app.app_context():
            db.client.drop_database('que_test')

    def register_physician(self):
        physician_data = {'fullname': 'Olajide Obasan', 'email': 'testmail@domain.com', 'password': 'newlife',
                          'username': 'username', 'confirm_password': 'newlife'}
        return self.app.post('/register', data=physician_data, follow_redirects=True)

    def login_physician(self):
        self.register_physician()
        login_data = {'unique_id': 'username', 'password': 'newlife'}
        return self.app.post('/login', data=login_data, follow_redirects=True)

    def get_auth_token(self):
        self.login_physician()
        return self.app.get('/get-auth-token')
