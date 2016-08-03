from datetime import datetime
import simplejson as json

from que import db
import test_class_base
from que.apps.appointments.models import availability_settings
from que import flask_app


class AppointmentsApiTest(test_class_base.TestClassBase):
    @staticmethod
    def create_hours():
        hours_data = [{'title': '9:00AM - 12:00PM', 'start_time': 9, 'end_time': 12},
                      {'title': '12:00PM - 3:00PM', 'start_time': 12, 'end_time': 15},
                      {'title': '3:00PM - 6:00PM', 'start_time': 15, 'end_time': 18},
                      {'title': '6:00PM - 9:00PM', 'start_time': 18, 'end_time': 21},
                      {'title': '9:00PM - 11:00PM', 'start_time': 21, 'end_time': 23}]
        hours = availability_settings.HoursCollection(db.mongo.Hours)
        with flask_app.app_context():
            return hours.insert_many(hours_data).inserted_ids

    def get_availability_settings(self):
        url = '/physicians/%s/availability-settings' % self.physician['_id']
        return self.app.get(url, headers=self.headers)

    def put_availability_setting(self, setting_id, update_data):
        url = '/physicians/%s/availability-settings/%s' % (self.physician['_id'], setting_id)
        return self.app.put(url, data=json.dumps(update_data), headers=self.headers)

    def test_put_availability_setting(self):
        hours = self.create_hours()
        setting = json.loads(self.get_availability_settings().data)['data'][0]
        rv = self.put_availability_setting(setting['id'], {'hours': [str(hours[0])]})
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertEqual(resp_data['repeat_weekly'], False)

    def test_get_availability_setting(self):
        rv = self.get_availability_settings()
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)['data']
        self.assertEqual(len(resp_data), 7)

    def post_video_consult(self):
        hours = self.create_hours()
        setting = json.loads(self.get_availability_settings().data)['data'][0]
        self.put_availability_setting(setting['id'], {'hours': [str(hours[0])]})
        video_consult_data = {'fullname': 'Obasan Olajide', 'email': 'jideobs@gmail.com', 'phone_number': '08091607291',
                              'appointment': str(setting['id']), 'hour': str(hours[0]),
                              'date_for': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        url = '/physicians/%s/video-consults' % self.physician['_id']
        return self.app.post(url, data=json.dumps(video_consult_data), headers=self.headers)

    def test_post_video_consult(self):
        rv = self.post_video_consult()
        self.assertEqual(rv.status_code, 200)

    def test_get_video_consults(self):
        self.post_video_consult()
        url = '/physicians/%s/video-consults' % self.physician['_id']
        rv = self.app.get(url, headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)['data']
        self.assertEqual(len(resp_data), 1)

    def test_get_hours(self):
        rv = self.app.get('/hours')
        self.assertEqual(rv.status_code, 200)

    def test_get_physician_availability(self):
        url = '/physicians/%s/availability' % self.physician['_id']
        rv = self.app.get(url)
        self.assertEqual(rv.status_code, 200)
