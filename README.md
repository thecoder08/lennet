# Lennet
A networking system that makes it easy to develop multiplayer games (sorta like Steamworks Networking, but easier). It works like a framework server-side and like a library client-side.
## The predicament
Let's say that you're an aspiring game developer, and you have experience making multiplayer games as you've made a couple before. You decide to make another one, and it becomes a big hit! There's one problem though: in order to host a game, you need your players to set up a dedicated server. This is difficult for the average user so it limits those who play your game to the more tech-savvy people, not to mention that it involves port forwarding or workarounds like ngrok. You decide look for a solution. You hear about networking services like Steamworks Networking but the documentation and API is really difficult to understand. Using them also involves a near entire rewrite of your networking code, which would be a pain. You also still want to give your power users the option to host their own server if they feel like it, and don't want to write TWO networking implementation for Steamworks and dedicated platforms.
## Why Lennet?
Lennet is a simple networking implementation with awesome features like lobbies that allows you to easily transition your games to a networking service with almost no extra code. Users can easily share lobby IDs with others without worrying about issues on their own network.
## How does it work (player's perspective)?
Lets say you heard about this awesome indie game and you want to try it out. You download the game and run it. You get to the part where you have to join a lobby or create a lobby. To create a lobby, just click a button and the game gives you a code to share with friends. To join a lobby, you get that code from a friend and enter it in. You join up seamlessly! You notice an option to "Join a dedicated server", but it it is off and labeled "not recommended" so you ignore it.
## How does it work (dev's perspective)?
When users try your game, they see an option to use Lennet or a dedicated server. Using Lennet allows them to easily share a lobby ID with friends, which behind the scenes is just auto-starting an instance of your game server, or receive one from friends and join easily. Using a dedicated server could be labeled as "not recommended" so as to not confuse them.
## How do you set it up (client-side)?
Setup requires almost no extra code. say you make a request to a server:
```javascript
request('http://server.com/action?param1=value&param2=value');
```
To transition to Lennet, just have the server set to your Lennet server and add another parameter called `lennetlobbyid` to each action that contains the player's Lennet lobby ID:
```javascript
request('http://mygameslennetserver.io/action?param1=value&param2=value&lennetlobbyid=value');
```
To "create a lobby" by requesting a Lennet lobby ID to start an instance of your server just send a request to the Lennet server with the action `getlennetlobbyid`:
```javascript
request('http://mygameslennetserver.io/getlennetlobbyid');
```
The server then returns a string that is the Lennet lobby ID to join the server instance.
## How do you set it up (server-side)?
Setting up your server to work with Lennet just involves placing your server code inside a function so that Lennet can start an instance of your server when nessesary. Take this server code for example, from my game [Math Shoot](https://github.com/thecoder08/math-shoot-gui):
```javascript
var http = require('@thecoder08/http');
var prompt = require('@thecoder08/prompt');
var fs = require('fs');
var people = {};
console.log('Server running. Type "help" for help.');
http.server(process.argv[3], function(req, res, redirect) {
  if (req.pathname == '/get') {
    res(200, 'text/plain', JSON.stringify(people));
  }
  else if (req.pathname == '/join') {
    people[req.query.name] = {
      x: 100,
      y: 100,
      shotX: 1000,
      shotY: 1000,
      hp: 100
    };
    console.log(req.query.name + ' joined the game.');
    res(200, 'text/plain', 'joined successfully');
  }
  else if (req.pathname == '/shoot') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].shotX = req.query.x;
      people[req.query.name].shotY = req.query.y;
      for (var person in people) {
        if (Math.round(Math.hypot(people[person].x - people[req.query.name].shotX, people[req.query.name].shotY - people[person].y)) < 100) {
          people[person].hp -= (100 - Math.round(Math.hypot(people[person].x - people[req.query.name].shotX, people[req.query.name].shotY - people[person].y)));
        }
        if (people[person].hp < 1) {
          http.request({
            hostname: 'localhost',
            port: process.argv[3],
            path: '/leave?name=' + person,
          }, function(data) {});
          console.log(person + ' died.');
        }
      }
      res(200, 'text/plain', 'shot successfully');
      setTimeout(function() {
        if (people.hasOwnProperty(req.query.name)) {
          people[req.query.name].shotX = 1000;
          people[req.query.name].shotY = 1000;
        }
      }, 500);
    }
    else {
      res(400, 'text/plain', 'join the server to shoot');
    }
  }
  else if (req.pathname == '/up') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].y -= 20;
      res(200, 'text/plain', 'moved up successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/down') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].y += 20;
      res(200, 'text/plain', 'moved down successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/left') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].x -= 20;
      res(200, 'text/plain', 'moved left successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/right') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].x += 20;
      res(200, 'text/plain', 'moved right successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/leave') {
    delete people[req.query.name];
    console.log(req.query.name + ' left the game.');
    res(200, 'text/plain', 'left successfully');
  }
  else if (req.pathname == '/players') {
    res(200, 'text/plain', Object.keys(people).length.toString());
  }
  else if (req.pathname == '/motd') {
    res(200, 'text/plain', process.argv[4]);
  }
  else if (req.pathname == '/icon') {
    fs.readFile(process.argv[5], function(err, data) {
      if (err) {
        res(404, 'text/plain', '404 not found');
      }
      else {
        res(200, 'image/png', data);
      }
    });
  }
  else {
    res(404, 'text/plain', '404 not found');
  }
});
prompt.interface('', function(data) {
  var tokens = data.toString().split(require('os').EOL)[0].split(' ');
  if (tokens[0] == 'list') {
    for (var person in people) {
      console.log('Player ' + person + ' is at x: ' + people[person].x + ' y: ' + people[person].y + ' shotX: ' + people[person].shotX + ' shotY: ' + people[person].shotY + ' hp: ' + people[person].hp + '.');
    }
  }
  else if (tokens[0] == 'help') {
    console.log('list: List all players and their cordinates.');
    console.log('help: Display this help menu.');
    console.log('stop: Stop the server.');
    console.log('tp [player] [x] [y]: Teleport player [player] to x position [x] and y position [y].');
    console.log('kick [name]: Kick the player with name [name] from the server.');
  }
  else if (tokens[0] == 'stop') {
    console.log('Stopping the server...');
    process.exit();
  }
  else if (tokens[0] == 'kick') {
    http.request({
      hostname: 'localhost',
      port: process.argv[3],
      path: '/leave?name=' + tokens[1]
    }, function(data) {});
    console.log('Kicked ' + tokens[1] + '.');
  }
  else if (tokens[0] == 'tp') {
    people[tokens[1]].x = parseInt(tokens[2]);
    people[tokens[1]].y = parseInt(tokens[3]);
  }
  else {
    console.log(tokens[0] + ': command not found.');
  }
});
```
To make it a Lennet server instance, we first import the Lennet framework, then call `setServerInstance` to set the server instance to a function containing all of the code, then replace the HTTP listening code with the Lennet `registerRequestHandler` function. Finally, to start the server we call `init` with a specific port number. This server also has some code for a command line interface. Unfortunately, because each instance is running in the same process, there is no way to interface with a specific one. Hence, the CLI code has to go. This is the result:
```javascript
var lennet = require('@thecoder08/lennet');
lennet.setServerInstance(function(id) {
var fs = require('fs');
var people = {};
console.log('Server ' + id + ' running. Type "help" for help.');
lennet.registerRequestHandler(id, function(req, res) {
  if (req.pathname == '/get') {
    res(200, 'text/plain', JSON.stringify(people));
  }
  else if (req.pathname == '/join') {
    people[req.query.name] = {
      x: 100,
      y: 100,
      shotX: 1000,
      shotY: 1000,
      hp: 100
    };
    console.log(req.query.name + ' joined the game.');
    res(200, 'text/plain', 'joined successfully');
  }
  else if (req.pathname == '/shoot') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].shotX = req.query.x;
      people[req.query.name].shotY = req.query.y;
      for (var person in people) {
        if (Math.round(Math.hypot(people[person].x - people[req.query.name].shotX, people[req.query.name].shotY - people[person].y)) < 100) {
          people[person].hp -= (100 - Math.round(Math.hypot(people[person].x - people[req.query.name].shotX, people[req.query.name].shotY - people[person].y)));
        }
        if (people[person].hp < 1) {
          http.request({
            hostname: 'localhost',
            port: process.argv[3],
            path: '/leave?name=' + person,
          }, function(data) {});
          console.log(person + ' died.');
        }
      }
      res(200, 'text/plain', 'shot successfully');
      setTimeout(function() {
        if (people.hasOwnProperty(req.query.name)) {
          people[req.query.name].shotX = 1000;
          people[req.query.name].shotY = 1000;
        }
      }, 500);
    }
    else {
      res(400, 'text/plain', 'join the server to shoot');
    }
  }
  else if (req.pathname == '/up') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].y -= 20;
      res(200, 'text/plain', 'moved up successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/down') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].y += 20;
      res(200, 'text/plain', 'moved down successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/left') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].x -= 20;
      res(200, 'text/plain', 'moved left successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/right') {
    if (people.hasOwnProperty(req.query.name)) {
      people[req.query.name].x += 20;
      res(200, 'text/plain', 'moved right successfully');
    }
    else {
      res(400, 'text/plain', 'join the server to move');
    }
  }
  else if (req.pathname == '/leave') {
    delete people[req.query.name];
    console.log(req.query.name + ' left the game.');
    res(200, 'text/plain', 'left successfully');
  }
  else if (req.pathname == '/players') {
    res(200, 'text/plain', Object.keys(people).length.toString());
  }
  else if (req.pathname == '/motd') {
    res(200, 'text/plain', process.argv[4]);
  }
  else if (req.pathname == '/icon') {
    fs.readFile(process.argv[5], function(err, data) {
      if (err) {
        res(404, 'text/plain', '404 not found');
      }
      else {
        res(200, 'image/png', data);
      }
    });
  }
  else {
    res(404, 'text/plain', '404 not found');
  }
});
});
lennet.init(process.argv[3]);
```
The server now works perfectly under Lennet. Use Lennet with your game today!
