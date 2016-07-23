from flask import Blueprint
from flask_restful import Api

import apis

appointment_app = Blueprint('appointment', __name__)
appointment_api = Api(appointment_app)

appointment_api.add_resource(apis.HoursApi, '/hours')
appointment_api.add_resource(apis.AvailabilitySettingsApi, '/physicians/<string:physician_id>/availability-settings',
                             '/physicians/<string:physician_id>/availability-settings/<string:setting_id>')
appointment_api.add_resource(apis.VideoConsultsApi, '/physicians/<string:physician_id>/video-consults')
appointment_api.add_resource(apis.ClientsVideoConsultsApi, '/physicians/<string:physician_id>/video-consults')
appointment_api.add_resource(apis.AvailabilityApi, '/physicians/<string:physician_id>/availability')
