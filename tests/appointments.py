from copy import copy
from datetime import timedelta
import simplejson as json

from db import mongo
from utils import get_date
import test_class_base
from app import flask_app


class AppointmentsApiTest(test_class_base.TestClassBase):
    current_time = get_date().time()
    availability_times = [
        {'title': '9:00AM - 9:15AM', 'start_time': current_time.replace(hour=9, minute=0, second=0, microsecond=0).strftime('%H:%M:%S'),
         'end_time': current_time.replace(hour=9, minute=15, second=0, microsecond=0).strftime('%H:%M:%S')},

        {'title': '12:00PM - 12:15PM', 'start_time': current_time.replace(hour=12, minute=0, second=0, microsecond=0).strftime('%H:%M:%S'),
         'end_time': current_time.replace(hour=12, minute=15, second=0, microsecond=0).strftime('%H:%M:%S')}
    ]

    def setUp(self):
        self.current_date = get_date()
        super(AppointmentsApiTest, self).setUp()

    def create_availability_times(self):
        with flask_app.app_context():
            return mongo.db.AvailabilityTimes.insert_many(self.availability_times).inserted_ids

    def get_availability_settings(self):
        url = '/physicians/%s/availability-settings' % self.physician['_id']
        return self.app.get(url, headers=self.headers)

    def put_availability_setting(self, setting_id, update_data=None):
        url = '/physicians/%s/availability-settings/%s' % (self.physician['_id'], setting_id)
        
        available_times = []
        if not update_data:
            def stringify_id(available_time):
                available_time['id'] = str(available_time.pop('_id'))
                return available_time
            available_times = map(stringify_id, copy(self.availability_times))
            update_data = {'availability_times': available_times}
        return self.app.put(url, data=json.dumps(update_data), headers=self.headers)

    def test_put_availability_setting(self):
        setting = json.loads(self.get_availability_settings().data)['data'][0]
        self.create_availability_times()
        rv = self.put_availability_setting(setting['id'])
        resp_data = json.loads(rv.data)
        self.assertEqual(rv.status_code, 200)
        self.assertEqual(resp_data['repeat_weekly'], False)
        self.assertEqual(len(resp_data['availability_times']), 2)
        
    def test_get_availability_setting(self):
        rv = self.get_availability_settings()
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)['data']
        self.assertEqual(len(resp_data), 7)

    def post_video_consult(self, appointment_time_data):
        hours = self.create_availability_times()
        setting = json.loads(self.get_availability_settings().data)['data'][0]
        self.put_availability_setting(setting['id'])

        video_consult_data = {'fullname': 'Obasan Olajide', 'email': 'jideobs@gmail.com', 'phone_number': '08091607291',
                              'appointment': str(setting['id']), 'start_date': appointment_time_data['start_date'],
                              'end_date': appointment_time_data['end_date']}
        url = '/physicians/%s/video-consults' % self.physician['_id']
        return self.app.post(url, data=json.dumps(video_consult_data), headers=self.headers)

    def test_post_video_consult__invalid_start_date(self):
        rv = self.post_video_consult({'start_date': (self.current_date - timedelta(1))
                                     .replace(minute=0, second=0, microsecond=0)
                                     .strftime('%Y-%m-%d %H:%M:%S'), 
                                      'end_date': self.current_date.replace(minute=15, second=0, microsecond=0)
                                     .strftime('%Y-%m-%d %H:%M:%S')})

        resp_data = json.loads(rv.data)
        self.assertEqual(rv.status_code, 400)
        self.assertEqual('Invalid start date.', resp_data['message'])

    def test_post_video_consult__invalid_end_date(self):
        rv = self.post_video_consult({'start_date': (self.current_date + timedelta(1)).strftime('%Y-%m-%d %H:%M:%S'),
                                      'end_date': self.current_date.strftime('%Y-%m-%d %H:%M:%S')})
        resp_data = json.loads(rv.data)
        self.assertEqual(rv.status_code, 400)
        self.assertEqual('Invalid end date.', resp_data['message'])
    
    def test_post_video_consult__time_already_choosen(self):
        current_date = self.current_date + timedelta(1)
        time_data = {'start_date': current_date.strftime('%Y-%m-%d %H:%M:%S'),
                     'end_date': (current_date + timedelta(minutes=15)).strftime('%Y-%m-%d %H:%M:%S')}
        
        self.post_video_consult(time_data)
        rv = self.post_video_consult(time_data)
        resp_data = json.loads(rv.data)
        self.assertEqual(rv.status_code, 400)
        self.assertEqual('Time already chosen.', resp_data['message'])
        
    def test_post_video_consult(self):
        current_date = self.current_date + timedelta(1)
        rv = self.post_video_consult({'start_date': current_date.strftime('%Y-%m-%d %H:%M:%S'),
                                      'end_date': (current_date + timedelta(minutes=15))
                                     .strftime('%Y-%m-%d %H:%M:%S')})
        self.assertEqual(rv.status_code, 200)

    def test_get_video_consults(self):
        current_date = self.current_date + timedelta(1)
        self.post_video_consult({'start_date': current_date.strftime('%Y-%m-%d %H:%M:%S'),
                                 'end_date': (current_date + timedelta(minutes=15))
                                .strftime('%Y-%m-%d %H:%M:%S')})
        url = '/physicians/%s/video-consults' % self.physician['_id']
        rv = self.app.get(url, headers=self.headers)
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)['data']
        self.assertEqual(len(resp_data), 1)

    def test_get_availability_times(self):
        rv = self.app.get('/availability-times')
        self.assertEqual(rv.status_code, 200)

    def test_get_physician_availability(self):
        url = '/physicians/%s/availability' % self.physician['_id']
        rv = self.app.get(url)
        self.assertEqual(rv.status_code, 200)
