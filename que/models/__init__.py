from datetime import datetime

from mongokat import Document, Collection


class AvailabilitySettings(Document):
    structure = {
        'day': unicode,
        'physician': unicode,
        'hours': list,
        'repeat_weekly': bool,
        'date_added': datetime,
        'date_last_modified': datetime
    }


class AvailabilitySettingsCollection(Collection):
    document_class = AvailabilitySettings
