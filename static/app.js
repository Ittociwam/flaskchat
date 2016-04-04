// Set up the application when the DOM has loaded
document.addEventListener('DOMContentLoaded', function() {

  HOST = window.location.hostname;
  body_class = document.getElementsByTagName('body')[0].className;

  // When we are on the index page, take user to room if they have entered a username
  if (body_class == "index") {
    if (localStorage['name']) {
      window.location = 'http://' + HOST + ':5000/room/' + localStorage['name'];
    }

    enterRoomButton = document.getElementById("enterRoom");


    enterRoomButton.addEventListener('click', function() {
      name = document.getElementById('name').value;
      localStorage['name'] = name;
      window.location = 'http://' + HOST + ':5000/room/' + name;
    });

  }

  // When we are successfully in the room, load previous messages and connect to a socket
  if (body_class == 'room') {
    getMessages();
    var socket = io.connect('http://' + HOST + ':5000/post_message')
    var sendButton = document.getElementById('sendButton')
    var messageBox = document.getElementById('messageBox')
    // Any response from this socket means a new message has been sent
    socket.on('response', function(msg) {
        getMessages()
      })
    // When the user clicks send, emit our message to the server
    sendButton.addEventListener('click', function() {
      message = messageBox.value
      name = localStorage['name']
      data = {
        'message': message,
        'name': name
      }
      data = JSON.stringify(data)
      socket.emit('post_message', {
        data: data
      });
      messageBox.value = ''
    })


  }
}, false);

// Take data from getMessages and write it to the clients screen
function renderMessages(data) {
  var messages = JSON.parse(data)['mycollectionKey']
  var messageList = document.getElementById('messages')

  // Empty old messages
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
  // position scrolling at bottom
  var messsage_div = document.getElementById('messages_div')
  messages_div.scrollTop = messages_div.scrollHeight
}
 // Make a GET request to the server to retrieve messages
function getMessages() {
  httpGET('http://' + HOST + ':5000/messages', function(data) {
    renderMessages(data)
  })
}


// Perform an httpGET request
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

// Perform an httpPOST request
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