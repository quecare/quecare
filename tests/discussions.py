import simplejson as json

import test_class_base


class DiscussionTestCases(test_class_base.TestClassBase):
    def post_question(self):
        question_data = {'question': 'I have pain in my stomach', 'fullname': 'Obasan Olajide',
                         'email': 'jideobs@gmail.com', 'phone_number': '08091607291'}
        url = '/physicians/%s/questions' % self.physician['_id']
        return self.app.post(url, data=json.dumps(question_data), headers={'Content-type': 'application/json'})

    def test_post_question(self):
        rv = self.post_question()
        self.assertEqual(rv.status_code, 200)
        resp_data = json.loads(rv.data)
        self.assertIsNotNone(len(resp_data))

    def test_get_questions(self):
        self.post_question()
        url = '/physicians/%s/questions' % self.physician['_id']
        rv = self.app.get(url, headers=self.headers)
        self.assertEqual(rv.status_code, 200)

        resp_data = json.loads(rv.data)
        self.assertEqual(len(resp_data['data']), 1)

    def post_answer(self, question_id):
        answer_data = {'answer': 'This is the answer'}
        url = '/questions/%s/answers' % question_id
        return self.app.post(url, data=json.dumps(answer_data), headers=self.headers)

    def test_post_answer(self):
        question = self.post_question()
        question_id = json.loads(question.data)['id']
        rv = self.post_answer(question_id)
        self.assertEqual(rv.status_code, 200)

    def test_get_answers(self):
        question = self.post_question()
        question_id = json.loads(question.data)['id']
        self.post_answer(question_id)
        url = '/questions/%s/answers' % question_id
        rv = self.app.get(url, headers=self.headers)
        self.assertEqual(rv.status_code, 200)
