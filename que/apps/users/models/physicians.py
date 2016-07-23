from datetime import datetime

from flask_login import UserMixin
from mongokat import Collection, Document
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)

from que import flask_app, db


class Physician(Document):
    structure = {'fullname': unicode, 'email': unicode, 'password': str,
                 'bio': unicode, 'date_created': datetime, 'date_last_updated': datetime}


class PhysicianCollection(Collection):
    document_class = Physician


class PhysicianModel(UserMixin):
    def __init__(self, physician_data):
        for (field, value) in physician_data.items():
            if field == '_id':
                setattr(self, 'id', str(value))
            else:
                setattr(self, field, value)

    def generate_auth_token(self):
        s = Serializer(flask_app.config['SECRET_KEY'])
        return s.dumps({'id': str(self.id)})

    @classmethod
    def get_physician(cls, physician_id):
        physician = PhysicianCollection(db.mongo.Physicians).find_by_id(physician_id)
        return PhysicianModel(physician)

    @classmethod
    def verify_auth_token(cls, token):
        s = Serializer(flask_app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return False
        except BadSignature:
            return False
        physician_data = PhysicianCollection(db.mongo.Physicians).find_by_id(data['id'])
        return PhysicianModel(physician_data)
