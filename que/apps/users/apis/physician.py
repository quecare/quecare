from flask_restful import Resource, reqparse, marshal_with

from que import utils
from que import db
from que.apps.users.models import physicians

physician_fields = utils.generate_model_fields(physicians.Physician.structure, excludes=('password',))


class PhysicianApi(Resource):
    @marshal_with(physician_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email', type=str, required=True)
        parser.add_argument('fullname', type=str, required=True)
        parser.add_argument('bio', type=str, required=False)
        parser.add_argument('password', type=str, required=True)

        args = parser.parse_args()
        args['date_created'] = args['date_last_updated'] = utils.get_date()
        physician = physicians.PhysicianCollection(collection=db.mongo.Phsyicians)
        args['_id'] = physician.insert(args)
        return args
