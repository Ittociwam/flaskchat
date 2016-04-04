from flask import Flask, render_template, request, json, Response
from pymongo import MongoClient
from datetime import datetime
from bson import json_util
import bson
from flask_socketio import SocketIO, emit
import pytz
from pytz import timezone

app = Flask(__name__)
socketio = SocketIO(app)

# Insert mongo connection here
db = MongoClient("mongodb://chat_user:chatuser@localhost:27017/mydb").mydb


def send_message(message):
    """
    Function to insert a users message into the database
    """
    message = json.loads(message)
    name = message['name']
    message = message['message']
    print (name)
    print (message)
    date = datetime.now(pytz.timezone("America/Boise"))
    dict_insert = {'name': name, 'message':message, 'date':str(date)}
    db.messages.insert_one(dict_insert)


def get_messages():
    """
    Gets a list of  messages from the database and sorts them by date to return to the  user
    """
    docs = db.messages.find()
    docs = docs.sort("date", 1)
    return bson.json_util.dumps({'success: ': True, 'mycollectionKey': docs})


@app.route("/")
def home():
    """
    Renders the home endpoint to get a username for first time users
    """
    return render_template('index.html')


@app.route("/messages", methods=['GET'])
def messages():
    """
    The messages endpoint to accept a GET request from client
    """
    return get_messages(request)


@socketio.on('post_message', namespace='/post_message')
def post_message(message):
    """
    The post message handler, sends the given message to the database and lets all other
    clients know that there has been an update
    """
    print ("here we are " + message['data'])
    send_message(message['data'])
    emit('response', {'data': 'message'}, broadcast=True)


@socketio.on('connect', namespace='/post_message')
def test_connect():
    """
    Lets client know a connection was successful
    """
    print 'connected!'
    emit('my response', {'data': 'Connected'})


@app.route("/room/<name>")
def room(name):
    """
    The room endpoint, the chat room template is rendered for the client
    """
    return render_template('room.html', name=name)

if __name__ == "__main__":
    app.debug = True
    # socketio.run(app, host='192.168.0.145', port=5000)
    socketio.run(app)
