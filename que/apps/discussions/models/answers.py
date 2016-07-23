from datetime import datetime

from mongokat import Document, Collection


class Answers(Document):
    structure = {
        'question': unicode,
        'answer': unicode,
        'date_answered': datetime,
        'date_last_modified': datetime
    }


class AnswersCollection(Collection):
    document_class = Answers
