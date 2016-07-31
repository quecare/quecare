from celery import Celery

from que import db, utils, flask_app
from que.apps.appointments.models import availability_settings


def make_celery(app):
    celery = Celery(app.import_name, backend=app.config['CELERY_RESULT_BACKEND'],
                    broker=app.config['CELERY_BROKER_URL'])
    celery.conf.update(app.config)
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery


que_celery = make_celery(flask_app)


@que_celery.task()
def create_availability_settings(physician_id):
    availability_settings_model = availability_settings.AvailabilitySettingsCollection(
        db.mongo.AvailabilitySettings)

    current_date = utils.get_date()
    for day in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'):
        availability_settings_model.insert({'physician': str(physician_id), 'day': day,
                                            'date_added': current_date,
                                            'date_last_modified': current_date})
