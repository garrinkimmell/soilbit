import os
from flask.ext.login import LoginManager
from flask.ext.openid import OpenID
from flask import Flask, request, url_for, render_template, send_from_directory, g

from pymongo import MongoClient

app = Flask(__name__) # , static_path='')
app.secret_key = 'This is really unique and secret'
app.config.from_object('app.config.Config')
app.debug = True

# Database stuff
connection = MongoClient(app.config['MONGO_URL'], app.config['MONGO_PORT'])
db = connection['soilbit']
db.authenticate(app.config['MONGO_USER'],app.config['MONGO_PWD'])



lm = LoginManager()
lm.setup_app(app)
lm.login_view = 'login'
oid = OpenID(app, '/tmp')

from app import views, models
