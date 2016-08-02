from itsdangerous import (TimedJSONWebSignatureSerializer as Serializer, BadSignature, SignatureExpired)
from que import flask_app


def generate_confirmation_token(unique_id, expires_in=None):
    serializer = Serializer(flask_app.config['SECRET_KEY'], expires_in=expires_in)
    return serializer.dumps(unique_id, salt=flask_app.config['SECURITY_PASSWORD_SALT'])


def verify_token(token):
    serializer = Serializer(flask_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=flask_app.config['SECURITY_PASSWORD_SALT'])
    except SignatureExpired:
        return False
    except BadSignature:
        return False
    return email
