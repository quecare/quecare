import unittest

from que import flask_app, db
from que import background_tasks
from que.apps.appointments.models import availability_settings


class TestCases(unittest.TestCase):
    def tearDown(self):
        with flask_app.app_context():
            db.client.drop_database('que_test')

    @staticmethod
    def test_create_availability_settings():
        background_tasks.create_availability_settings(1)
        with flask_app.app_context():
            availability_model = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
            assert availability_model.find().count() == 7

    @staticmethod
    def test_send_client_discussion_info():
        background_tasks.send_client_discussion_info('Olajide Obasan', 'test@domain.com', 'http://testurl.com')
