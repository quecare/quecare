import os

from flask import Flask
from flask_mail import Mail

import config

flask_app = Flask(__name__)

env = os.environ.get('ENV')
if env == '1':
    flask_app.config.from_object(config.ProductionConfig)
elif env == '2':
    flask_app.config.from_object(config.TestingConfig)
else:
    flask_app.config.from_object(config.DevelopmentConfig)

que_mail = Mail(flask_app)
