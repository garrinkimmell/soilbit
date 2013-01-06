
from flask import Flask, request, url_for
import random
import config


# MongoLab stuff



app = Flask(__name__)
app.secret_key = 'This is really unique and secret'
app.config.from_object('config.Config')


@app.route('/')
def hello_person():
    return """
    <p>Who do you want me to say "Hi" to?</p>
    <form method="POST" action="%s"><input name="person" /><input type="submit" value="Go!" /></form>
    """ % (url_for('greet'),)

@app.route('/greet', methods=['POST'])
def greet():
    greeting = random.choice(["Hiya", "Hallo", "Hola", "Ola", "Salut", "Privet", "Konnichiwa", "Ni hao"])
    return """
    <p>%s, %s!: %s</p>
    <p><a href="%s">Back to start</a></p>
    """ % (greeting, request.form["person"], url_for('hello_person'), app.config['MONGO_PORT'])
