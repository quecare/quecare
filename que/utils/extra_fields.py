from datetime import datetime

from flask_restful import fields
from bson import ObjectId


class ObjectIdToData(fields.Raw):
    def __init__(self, mongo, model, model_fields=(), attribute=None, default=None):
        super(ObjectIdToData, self).__init__(default, attribute)
        self.mongo = mongo
        self.model = model
        self.fields = model_fields

    def format(self, entry_id):
        if type(entry_id) in (unicode, str):
            object_id = ObjectId(entry_id)
        else:
            object_id = entry_id
        data = self.mongo.db[self.model].find_one({'_id': object_id})
        if data:
            output = {'id': entry_id}
            for key, value in data.iteritems():
                if self.fields and key in self.fields:
                    if type(value) == datetime:
                        output[key] = value.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        output[key] = value
            return output
        else:
            return {}


class ObjectIdStr(fields.Raw):
    def format(self, value):
        return str(value)
