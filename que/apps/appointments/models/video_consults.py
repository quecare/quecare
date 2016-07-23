from datetime import datetime

from mongokat import Document, Collection


class VideoConsults(Document):
    structure = {
        'fullname': unicode,
        'email': unicode,
        'phone_number': unicode,
        'appointment': unicode,
        'hour': unicode,
        'room_name': unicode,
        'date_for': datetime,
        'date_chosen': datetime,
        'date_last_modified': datetime
    }


class VideoConsultsCollection(Collection):
    document_class = VideoConsults
