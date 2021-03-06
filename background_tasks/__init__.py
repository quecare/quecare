from celery import Celery
from flask import render_template
from flask_mail import Message

from db import mongo
from utils import get_date
from app import flask_app, que_mail


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


def send_mail(subject, recipients, html_body, text_body=None, sender='no-reply@mychora.com'):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    que_mail.send(msg)


@que_celery.task()
def create_availability_settings(physician_id):
    current_date = get_date()
    for day in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'):
        mongo.db.AvailabilitySettings.insert({'physician': str(physician_id), 'day': day,
                                              'date_added': current_date,
                                              'date_last_modified': current_date})


@que_celery.task()
def send_client_discussion_info(fullname, client_email, discussion_url):
    subject = 'Your discussion link'
    mail_html = render_template('email-templates/discussions-template.html', discussion_url=discussion_url,
                                fullname=fullname)
    send_mail(subject=subject, recipients=[client_email], html_body=mail_html)


@que_celery.task()
def send_client_appointment_info(fullname, client_email, appointment_url):
    subject = 'Your video appointment link'
    mail_html = render_template('email-templates/discussions-template.html', discussion_url=appointment_url,
                                fullname=fullname)
    send_mail(subject=subject, recipients=[client_email], html_body=mail_html)


@que_celery.task()
def notify_on_answer(fullname, client_email, discussion_url):
    subject = 'Your question just got answered'
    mail_html = render_template('email-templates/discussions-template.html', discussion_url=discussion_url,
                                fullname=fullname)
    send_mail(subject=subject, recipients=[client_email], html_body=mail_html)
