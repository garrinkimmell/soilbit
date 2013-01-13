from flask import render_template, flash, redirect, session, url_for, request, g
from flask.ext.login import login_user, logout_user, current_user, login_required

from app import app, db, lm, oid
from forms import LoginForm
from models import User

@app.before_request
def before_request():
    g.user = current_user

@app.route('/login', methods = ['GET', 'POST'])
@oid.loginhandler
def login():
    return oid.try_login('https://www.google.com/accounts/o8/id', ask_for = ['nickname', 'email'])


@lm.user_loader
def load_user(id):
    return User.get(id)


@oid.after_login
def after_login(resp):
    if resp.email is None or resp.email == "":
        flash('Invalid login. Please try again.')
        redirect(url_for('login'))
    user = User.get(resp.email)
    app.logger.debug('got user %s' % user)
    if user is None:
        nickname = resp.nickname
        if nickname is None or nickname == "":
                nickname = resp.email.split('@')[0]
        user = User(nickname = nickname, email = resp.email)
        user.save()
    remember_me = False
    if 'remember_me' in session:
        remember_me = session['remember_me']
        session.pop('remember_me', None)
    login_user(user, remember = remember_me)
    return redirect(request.args.get('next') or url_for('/'))


@app.route('/logout')
def logout():
    g.user = None
    logout_user()
    return redirect(url_for('index'))


@app.route('/')
@app.route('/index')
def index():
    app.logger.debug('%s is user' % g.user)
    if g.user is None or not g.user.is_authenticated():
        return render_template('index.html')
    else:
        user = g.user
        app.logger.debug('Index for user %s' % user)
        return render_template('index-user.html',
                               title = 'Home',
                               user = user)


@login_required
@app.route('/createfield')
def newfield():
    user = g.user
    return render_template('create-field.html',
                           user = user)
