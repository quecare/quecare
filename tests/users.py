import unittest

import simplejson as json

import test_class_base
from que.main import flask_app
from que import db
from que.apps.users.models import physicians


class AppRoutesTestCases(unittest.TestCase):
    def setUp(self):
        self.app = flask_app.test_client()

    def tearDown(self):
        with flask_app.app_context():
            db.client.drop_database('que_test')

    def test_register_get(self):
        rv = self.app.get('/register')
        self.assertIn('Register', rv.data)

    def register_physician(self):
        physician_data = {'fullname': 'Olajide Obasan', 'email': 'testmail@domain.com', 'password': 'newlife',
                          'username': 'username', 'confirm_password': 'newlife'}
        return self.app.post('/register', data=physician_data, follow_redirects=True)

    def test_register_physician(self):
        rv = self.register_physician()
        self.assertIn('Dashboard', rv.data)

    def login_physician(self):
        self.register_physician()
        login_data = {'unique_id': 'username', 'password': 'newlife'}
        return self.app.post('/login', data=login_data, follow_redirects=True)

    def test_login_get(self):
        rv = self.app.get('/login')
        self.assertIn('Login', rv.data)

    def test_login_physician(self):
        rv = self.login_physician()
        self.assertIn('Dashboard', rv.data)

    def test_fail_login_physician(self):
        rv = self.app.post('/login', follow_redirects=True)
        self.assertIn('Login', rv.data)

    def get_auth_token(self):
        self.login_physician()
        return self.app.get('/get-auth-token')

    def test_get_auth_token(self):
        rv = self.get_auth_token()
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertIsNotNone(resp_data['token'])


class PhysicianApiTestCases(test_class_base.TestClassBase):
    def register_physician(self):
        physician_data = {'fullname': 'Olajide Obasan', 'email': 'testmail@domain.com', 'password': 'newlife',
                          'username': 'username', 'confirm_password': 'newlife'}
        return self.app.post('/register', data=physician_data, follow_redirects=True)

    def login_physician(self):
        self.register_physician()
        login_data = {'unique_id': 'username', 'password': 'newlife'}
        return self.app.post('/login', data=login_data, follow_redirects=True)

    def test_put_physician(self):
        url = '/physicians/{}'.format(self.physician['_id'])
        update_data = {'fullname': 'Bolaji Obasan'}
        rv = self.app.put(url, data=json.dumps(update_data), headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertEqual(resp_data['fullname'], update_data['fullname'])
