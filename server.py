from flask import Flask, render_template, request, json, Response
from pymongo import MongoClient
from datetime import datetime
from bson import json_util
import bson
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)
db = MongoClient("mongodb://chat_user:ilmw2411@ds011820.mlab.com:11820/chat_cs460_db").chat_cs460_db


@app.route("/users")
def get_users():
    resp = ''
    for doc in db.users.find():
        resp += doc['name'] + ", "
    js = json.dumps(resp)
    resp = Response(js, status=200, mimetype='application/json')
    return resp


@app.route("/messages", methods=['GET'])
def messages():
    return get_messages(request)


def send_message(message):
    #print ('post',  str(request))
    #name = request.form['name']
    #message = request.form['message']
    message = json.loads(message)
    name = message['name']
    message = message['message']
    print (name)
    print (message)
    date = datetime.now()
    dict_insert = {'name': name, 'message':message, 'date':str(date)}
    db.messages.insert_one(dict_insert)
    #print("OID: ", oid['_id'])
    return "great job"


def get_messages(request=''):
    docs = db.messages.find()
    docs = docs.sort("date", 1)
    return bson.json_util.dumps({'success: ': True, 'mycollectionKey': docs})


@app.route("/")
def home():
    return render_template('index.html')


@socketio.on('post_message', namespace='/post_message')
def post_message(message):
    print ("here we are " + message['data'])
    send_message(message['data'])
    emit('response', {'data': 'message'}, broadcast=True)


@socketio.on('connect', namespace='/post_message')
def test_connect():
    print 'connected!'
    emit('my response', {'data': 'Connected'})

@socketio.on('message')
def handle_message(message):
    print ('received message!' + message)


@app.route("/room/<name>")
def room(name):
    return render_template('room.html', name=name)

if __name__ == "__main__":
    app.debug = True
    socketio.run(app, host='192.168.0.145', port=5000)
