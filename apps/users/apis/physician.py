from flask_restful import Resource, reqparse, marshal_with, abort, fields

from db import mongo
from bson import ObjectId
from utils import extra_fields, get_date

physician_fields = {'id': extra_fields.ObjectIdStr(attribute='_id'), 'fullname': fields.String,
                    'username': fields.String, 'profile_pic': fields.String, 'qualification': fields.String}


class PhysicianApi(Resource):
    @marshal_with(physician_fields)
    def put(self, physician_id):
        physician_id = ObjectId(physician_id)
        parser = reqparse.RequestParser()
        parser.add_argument('fullname', type=str, required=False)
        parser.add_argument('bio', type=str, required=False)
        parser.add_argument('username', type=str, required=False)
        parser.add_argument('profile_pic', type=str, required=False)
        parser.add_argument('qualification', type=str, required=False)
        args = parser.parse_args()

        valid_values = {}
        for field, value in args.items():
            if value:
                valid_values.update({field: value})

        if not valid_values:
            abort(400, message='No data passed to server')

        valid_values['date_created'] = args['date_last_updated'] = get_date()
        result = mongo.db.Physicians.update_one({'_id': physician_id}, {'$set': valid_values})
        if result.modified_count == 0:
            abort(400, message='Could not update user')
        return mongo.db.Physicians.find_one({'_id': physician_id})
