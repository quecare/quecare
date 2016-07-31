from que import flask_app, db
from que import background_tasks
from que.apps.appointments.models import availability_settings


def test_create_availability_settings():
    background_tasks.create_availability_settings(1)
    with flask_app.app_context():
        availability_model = availability_settings.AvailabilitySettingsCollection(db.mongo.AvailabilitySettings)
        assert availability_model.find().count() == 7
