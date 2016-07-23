from pymongo import MongoClient

from que import flask_app

client = MongoClient()
mongo = client[flask_app.config['MONGO_DBNAME']]
