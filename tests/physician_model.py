import test_class_base
from que.apps.users.models import physicians


class PhysicianModelClassTest(test_class_base.TestClassBase):
    def create_auth_token(self):
        physician = physicians.PhysicianModel(self.physician)
        return physician.generate_auth_token()

    def test_verify_auth_token(self):
        token = self.create_auth_token()
        physician = physicians.PhysicianModel.verify_auth_token(token)
        self.assertEqual(self.physician['_id'], physician['_id'])
