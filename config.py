class Config(object):
    DEBUG = False
    TESTING = False

    MONGO_DBNAME = 'que'
    SECRET_KEY = 'Ewa bere ibere yin'
    SECURITY_PASSWORD_SALT = 'This is it...'

    CELERY_BROKER_URL = 'amqp://guest@localhost//'
    CELERY_RESULT_BACKEND = 'amqp://'
    CELERY_TIMEZONE = 'Africa/Lagos'
    CELERY_ACCEPT_CONTENT = ['json']
    CELERY_TASK_SERIALIZER = 'json'

    # mail server settings
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'team@avorol.com'
    MAIL_PASSWORD = 'WebWizard#1'
    MAIL_DEFAULT_SENDER = 'no-reply@avorol.com'


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    DEBUG = True
    TESTING = True

    MONGO_DBNAME = 'que_test'

    CELERY_ALWAYS_EAGER = True
