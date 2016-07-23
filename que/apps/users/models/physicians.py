from mongokat import Collection, Document
from datetime import datetime


class Physician(Document):
    structure = {'fullname': unicode, 'email': unicode, 'password': str,
                 'bio': unicode, 'date_created': datetime, 'date_last_updated': datetime}


class PhysicianCollection(Collection):
    document_class = Physician
