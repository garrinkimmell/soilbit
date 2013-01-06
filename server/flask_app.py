
from flask import Flask, request, url_for, render_template, send_from_directory
import random
import config
from pymongo import MongoClient


# MongoLab stuff



app = Flask(__name__)
app.secret_key = 'This is really unique and secret'
app.config.from_object('config.Config')


connection = MongoClient(app.config['MONGO_URL'], app.config['MONGO_PORT'])
db = connection['soilbit']
db.authenticate(app.config['MONGO_USER'],app.config['MONGO_PWD'])


app.add_url_rule('/favicon.ico',
                 redirect_to=url_for('static', filename='favicon.ico'))

app.add_url_rule('/',
                 redirect_to=url_for('static', filename='index.html'))

# def hello_person():
#     return """
#     <p>Who do you want me to say "Hi" to?</p>
#     <form method="POST" action="%s"><input name="person" /><input type="submit" value="Go!" /></form>
#     """ % (url_for('greet'),)



@app.route('/greet', methods=['POST'])
def greet():
    greeting = random.choice(["Hiya", "Hallo", "Hola", "Ola", "Salut", "Privet", "Konnichiwa", "Ni hao"])
    return """
    <p>%s, %s!: %s</p>
    <p><a href="%s">Back to start</a></p>
    """ % (greeting, request.form["person"],  app.config['MONGO_PORT'], url_for('hello_person'))
