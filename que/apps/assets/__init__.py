from flask import Blueprint

assets_app = Blueprint('assets', __name__, static_folder='client')
