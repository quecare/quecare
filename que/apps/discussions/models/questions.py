from datetime import datetime
from mongokat import Document, Collection


class Questions(Document):
    structure = {
        'email': unicode,
        'fullname': unicode,
        'phone_number': unicode,
        'question': unicode,
        'date_asked': datetime,
        'date_last_updated': datetime
    }


class QuestionsCollection(Collection):
    document_class = Document
