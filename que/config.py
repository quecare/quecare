class Config(object):
    DEBUG = False
    TESTING = False

    MONGO_DBNAME = 'que'
    SECRET_KEY = 'Ewa bere ibere yin'


class ProductionConfig(Config):
    pass


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    DEBUG = True
    TESTING = True

    MONGO_DBNAME = 'que_test'
