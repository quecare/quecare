import unittest

from app import flask_app
from db import mongo
import background_tasks


class TestCases(unittest.TestCase):
    def tearDown(self):
        with flask_app.app_context():
            mongo.db.client.drop_database('que_test')

    @staticmethod
    def test_create_availability_settings():
        background_tasks.create_availability_settings(1)
        with flask_app.app_context():
            assert mongo.db.AvailabilitySettings.find().count() == 7

    @staticmethod
    def test_send_client_discussion_info():
        background_tasks.send_client_discussion_info('Olajide Obasan', 'test@domain.com', 'http://testurl.com')
