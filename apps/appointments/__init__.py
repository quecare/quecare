from datetime import datetime

from flask import Blueprint, redirect, render_template
from flask_restful import Api
from bson import ObjectId

import apis
from db import mongo
from utils import token_utils, get_date

appointment_app = Blueprint('appointment', __name__)
appointment_api = Api(appointment_app)


@appointment_app.route('/appointment/<string:appointment_token>', methods=['GET'])
def appointment(appointment_token):
    appointment_id = token_utils.verify_token(appointment_token)
    if appointment_id:
        video_appointment = mongo.db.VideoConsults.find_one({'_id': ObjectId(appointment_id)})
        if video_appointment:
            physician = mongo.db.Physicians.find_one({'_id': ObjectId(video_appointment['physician'])})
            return render_template('video.html', physician=physician, appointment=video_appointment,
                                   current_date=get_date())
    return redirect('/')


appointment_api.add_resource(apis.AvailabilityTimesApi, '/availability-times')
appointment_api.add_resource(apis.AvailabilitySettingsApi, '/physicians/<string:physician_id>/availability-settings',
                             '/physicians/<string:physician_id>/availability-settings/<string:setting_id>')
appointment_api.add_resource(apis.VideoConsultsApi, '/physicians/<string:physician_id>/video-consults')
appointment_api.add_resource(apis.ClientsVideoConsultsApi, '/physicians/<string:physician_id>/video-consults',
                             '/video-consults/<string:consult_id>')
appointment_api.add_resource(apis.AvailabilityApi, '/physicians/<string:physician_id>/availability')
