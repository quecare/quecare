from datetime import datetime

from flask_restful import fields

from que import utils


def test_generate_model_fields():
    model_structure = {'fullname': unicode, 'username': unicode, 'date_registered': datetime}
    expected_output = {'fullname': fields.String, 'username': fields.String, 'date_registered': fields.DateTime}
    model_fields = utils.generate_model_fields(model_structure)

    assert model_fields == expected_output


def test_get_date():
    import pytz

    africa = pytz.timezone('Africa/Lagos')
    aware_datetime = africa.localize(datetime.utcnow())
    date = utils.get_date()

    assert aware_datetime.hour is date.hour
