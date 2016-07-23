from flask_restful import fields


class ObjectIdStr(fields.Raw):
    def format(self, value):
        return str(value)
