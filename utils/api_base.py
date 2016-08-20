import functools

from flask import request
from flask_restful import abort, Resource
from flask_login import current_user


def authenticate_user(api_method):
    @functools.wraps(api_method)
    def decorated_api_method(*args, **kwargs):
        auth_token = request.headers.get('auth-token')
        if not auth_token:
            abort(401, message='Invalid request.')

        physician = current_user.verify_auth_token(auth_token)
        if not physician:
            abort(403)
        else:
            if 'physician_id' in kwargs and str(physician['_id']) != kwargs['physician_id']:
                abort(401, message='Invalid access of resource')
            return api_method(*args, **kwargs)

    return decorated_api_method


class ApiBase(Resource):
    decorators = [authenticate_user]
