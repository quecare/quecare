import pytz
from datetime import datetime

from flask_restful import fields
from bson import ObjectId


def generate_model_fields(model_structure, excludes=None):
    model_fields = {}
    for (field, data_type) in model_structure.items():
        if excludes and (field in excludes):
            continue

        if (data_type is unicode) or (data_type is ObjectId):
            model_fields[field] = fields.String
        elif data_type is datetime:
            model_fields[field] = fields.DateTime
    return model_fields


def get_date(date=None, tzinfo=None):
    current_date = date if date else datetime.utcnow()
    utc = pytz.timezone('UTC')
    current_date = current_date.replace(tzinfo=utc)
    if not tzinfo:
        tzinfo = 'Africa/Lagos'

    nigeria = pytz.timezone(tzinfo)
    return current_date.astimezone(nigeria)
