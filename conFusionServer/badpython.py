from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=True, nullable=False)
    last_name = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return "<User %r>" % self.username


@app.route("/add_user")
def add_user():
    first_name = request.args.get("firstname")
    last_name = request.args.get("lastname")
    try:
        user = User(first_name=first_name, last_name=last_name)
        db.session.add(user)
        db.session.commit()
        return "User added. user id={}".format(user.id)
    except Exception as e:
        return str(e)


@app.route("/get_users")
def get_users():
    id = request.args.get("id")
    users = User.query.filter_by(id=id).first()
    return users.last_name
