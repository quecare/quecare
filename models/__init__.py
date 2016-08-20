from flask_login import UserMixin
from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from bson import ObjectId

from db import mongo
from app import flask_app


class Physician(UserMixin):
    def __init__(self, physician_data):
        for key, value in physician_data.items():
            if key == '_id':
                setattr(self, 'id', str(value))
            else:
                setattr(self, key, value)
    
    def generate_auth_token(self, expires_in=None):
        serializer = Serializer(flask_app.config['SECRET_KEY'], expires_in=expires_in)
        return serializer.dumps(self.id, salt=flask_app.config['SECURITY_PASSWORD_SALT'])
    
    def verify_auth_token(cls, token):
        serializer = Serializer(flask_app.config['SECRET_KEY'])
        try:
            physician_id = serializer.loads(token, salt=flask_app.config['SECURITY_PASSWORD_SALT'])
        except SignatureExpired:
            return False
        except BadSignature:
            return False
        return mongo.db.Physicians.find_one({'_id': ObjectId(physician_id)})