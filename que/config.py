class Config(object):
    DEBUG = False
    TESTING = False

    MONGO_DBNAME = 'que'
    SECRET_KEY = 'Ewa bere ibere yin'

    CELERY_BROKER_URL = 'amqp://guest@localhost//'
    CELERY_RESULT_BACKEND = 'amqp://'
    CELERY_TIMEZONE = 'Africa/Lagos'
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    DEBUG = True
    TESTING = True

    MONGO_DBNAME = 'que_test'

    CELERY_ALWAYS_EAGER = True
