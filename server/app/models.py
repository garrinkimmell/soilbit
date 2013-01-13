from pymongo import MongoClient
from app import db, app

class User():

    def __init__(self,nickname='Anonymous', email=None):
        self.nickname = nickname
        self.email = email

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.email)

    def get_fields(self):
        return None

    def __repr__(self):
        return '<User %r>' % (self.nickname)

    @classmethod
    def get(cls,id):
        # app.logger.debug('looking up %s' % id)
        u = db.users.find_one({'email' : id})
        if u:
            user = User(nickname=u['nickname'],email=u['email'])
            return user
        else:
            return None



    def save(self):
        # app.logger.debug('Adding user %s' % self)
        id = db.users.insert({'email': self.email, 'nickname' : self.nickname})
        self.id = id
        return self
