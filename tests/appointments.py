from datetime import datetime
import simplejson as json

from que import db
import test_class_base
from que.apps.appointments.models import availability_settings
from que import flask_app


class AppointmentsApiTest(test_class_base.TestClassBase):
    @staticmethod
    def create_hours():
        hours_data = [{'title': '9:00AM - 12:00PM', 'start_time': datetime(hour=9, day=1, year=2016, month=01),
                       'end_time': datetime(hour=12, day=1, year=2016, month=01)},
                      {'title': '12:00PM - 3:00PM', 'start_time': datetime(hour=12, day=1, year=2016, month=01),
                       'end_time': datetime(hour=15, day=1, year=2016, month=01)},
                      {'title': '3:00PM - 6:00PM', 'start_time': datetime(hour=15, day=1, year=2016, month=01),
                       'end_time': datetime(hour=18, day=1, year=2016, month=01)},
                      {'title': '6:00PM - 9:00PM', 'start_time': datetime(hour=18, day=1, year=2016, month=01),
                       'end_time': datetime(hour=21, day=1, year=2016, month=01)},
                      {'title': '9:00PM - 11:00PM', 'start_time': datetime(hour=21, day=1, year=2016, month=01),
                       'end_time': datetime(hour=23, day=1, year=2016, month=01)}]
        hours = availability_settings.HoursCollection(db.mongo.Hours)
        with flask_app.app_context():
            return hours.insert_many(hours_data).inserted_ids

    def post_availability_setting(self):
        hours_ids = self.create_hours()
        current_date = datetime.now()
        setting_data = {'day': current_date.strftime('%A').lower(),
                        'hours': [str(hours_ids[0]), str(hours_ids[2]), str(hours_ids[3]), str(hours_ids[4])],
                        'repeat_weekly': True}
        url = '/physicians/%s/availability-settings' % self.physician['_id']
        return self.app.post(url, data=json.dumps(setting_data), headers=self.headers)

    def test_post_availability_setting(self):
        rv = self.post_availability_setting()
        self.assertEqual(rv.status_code, 200)
        rv = self.post_availability_setting()
        self.assertEqual(rv.status_code, 400)

    def test_put_availability_setting(self):
        setting_data = self.post_availability_setting()
        setting_id = json.loads(setting_data.data)['id']
        update_data = {'repeat_weekly': False}
        url = '/physicians/%s/availability-settings/%s' % (self.physician['_id'], setting_id)
        rv = self.app.put(url, data=json.dumps(update_data), headers=self.headers)
        print rv.data
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertEqual(resp_data['repeat_weekly'], False)

    def test_get_availability_setting(self):
        self.post_availability_setting()
        url = '/physicians/%s/availability-settings' % self.physician['_id']
        rv = self.app.get(url, headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)['data']
        self.assertEqual(len(resp_data), 1)

    def post_video_consult(self):
        setting = self.post_availability_setting()
        setting_data = json.loads(setting.data)
        video_consult_data = {'fullname': 'Obasan Olajide', 'email': 'jideobs@gmail.com', 'phone_number': '08091607291',
                              'appointment': setting_data['id'], 'hour': setting_data['hours'][0],
                              'date_for': datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'room_name': 'test-name'}
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
        self.post_availability_setting()
        url = '/physicians/%s/availability' % self.physician['_id']
        rv = self.app.get(url)
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertEqual(len(resp_data['hours']), 4)
