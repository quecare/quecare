from datetime import datetime

from mongokat import Document, Collection


class Hours(Document):
    structure = {
        'title': unicode,
        'start_time': datetime,
        'end_time': datetime
    }


class HoursCollection(Collection):
    document_class = Hours


class AvailabilitySettings(Document):
    structure = {
        'day': unicode,
        'hours': list,
        'repeat_weekly': bool,
        'date_added': datetime,
        'date_last_modified': datetime
    }


class AvailabilitySettingsCollection(Collection):
    document_class = AvailabilitySettings
