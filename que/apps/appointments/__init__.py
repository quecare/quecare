from flask import Blueprint, redirect, render_template
from flask_restful import Api
from bson import ObjectId

import apis
from que import db
from que.utils import token_utils
from que.apps.appointments.models import video_consults
from que.apps.users.models import physicians

appointment_app = Blueprint('appointment', __name__)
appointment_api = Api(appointment_app)


@appointment_app.route('/appointment/<string:token>', methods=['GET'])
def handle_appointment(token):
    appointment_id = token_utils.verify_token(token)
    if appointment_id:
        appointment_model = video_consults.VideoConsultsCollection(db.mongo.VideoConsults)
        appointment = appointment_model.find_one({'_id': ObjectId(appointment_id)})
        if appointment:
            physician_model = physicians.PhysicianCollection(db.mongo.Physicians)
            physician = physician_model.find_one({'_id': ObjectId(appointment['physician'])})
            url = '/{}#/video/{}'.format(physician['username'], appointment_id)
            return redirect(url)
    return render_template('404.html'), 404


appointment_api.add_resource(apis.HoursApi, '/hours')
appointment_api.add_resource(apis.AvailabilitySettingsApi, '/physicians/<string:physician_id>/availability-settings',
                             '/physicians/<string:physician_id>/availability-settings/<string:setting_id>')
appointment_api.add_resource(apis.VideoConsultsApi, '/physicians/<string:physician_id>/video-consults')
appointment_api.add_resource(apis.ClientsVideoConsultsApi, '/physicians/<string:physician_id>/video-consults',
                             '/video-consults/<string:consult_id>')
appointment_api.add_resource(apis.AvailabilityApi, '/physicians/<string:physician_id>/availability')
