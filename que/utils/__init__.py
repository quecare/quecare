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


def get_date(tz=None):
    if not tz:
        tz = 'Africa/Lagos'
    locale_tz = pytz.timezone(tz)
    aware_datetime = locale_tz.localize(datetime.utcnow())
    return aware_datetime
