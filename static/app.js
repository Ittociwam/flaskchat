document.addEventListener('DOMContentLoaded', function() {

  body_class = document.getElementsByTagName('body')[0].className
  if (body_class == "index") {
    if (localStorage['name']) {
      window.location = 'http://localhost:5000/room/' + localStorage['name'];
    }

    enterRoomButton = document.getElementById("enterRoom");

    enterRoomButton.addEventListener('click', function() {
      name = document.getElementById('name').value;
      localStorage['name'] = name;
      window.location = 'http://localhost:5000/room/' + name;
    });

  }

  if (body_class == 'room') {
    getMessages();
    var socket = io.connect('http://localhost:5000/post_message')
      //
    socket.on('connect', function() {
      console.log('connected!')
      socket.emit('my event', {
        data: 'i am connected!'
      });
    })
    sendButton = document.getElementById('sendButton')
    messageBox = document.getElementById('messageBox')

    // when this socket sends back a message, we have a new message to load.
    socket.on('response', function(msg) {
        console.log('recieved a response', msg.data)
        getMessages()
      })
      // on click send, send the message
    sendButton.addEventListener('click', function() {
      console.log('button working')
      message = messageBox.value
      name = localStorage['name']
      data = {
        'message': message,
        'name': name
      }
      data = JSON.stringify(data)
      console.log(data)
      socket.emit('post_message', {
        data: data
      });
      messageBox.value = ''
    })


  }
}, false);

function renderMessages(data) {
  var messages = JSON.parse(data)['mycollectionKey']
  var messageList = document.getElementById('messages')

  if (messageList) {
    while (messageList.firstChild) {
      messageList.removeChild(messageList.firstChild)
    }
  }
  for (i in messages) {
    var message = messages[i]
    var node = document.createElement("LI")
    var text = message.name + ": " + message.message + " -" + message.date
    var textnode = document.createTextNode(text)
    node.appendChild(textnode)
    messageList.appendChild(node)
  }
  //position scrolling at bottom
  var messsage_div = document.getElementById('messages_div')
  messages_div.scrollTop = messages_div.scrollHeight
}

function getUsers() {
  httpGET('http://localhost:5000/users', function(data) {
    document.getElementById('users').value = data
  });
}

function getMessages() {
  httpGET('http://localhost:5000/messages', function(data) {
    renderMessages(data)
  })
}



function httpGET(url, callback) {
  console.log('url: ', url)
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

      callback(xmlhttp.responseText);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function httpPOST(url, postData, callback) {
  console.log('url: ', url)
  console.log('postData', postData)
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

      callback(xmlhttp.responseText);
    }
  }

  xmlhttp.open("POST", url, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
  xmlhttp.send(postData);
}