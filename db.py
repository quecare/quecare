from flask_pymongo import PyMongo

from app import flask_app

mongo = PyMongo(flask_app)
