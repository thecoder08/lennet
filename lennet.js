module.exports.init = function(port, command) {
var nextId = 0;
var cp = require('child_process');
var http = require('@thecoder08/http');
http.server(port, function (req, res) {
  if (req.pathname == '/getlennetlobbyid') {
    var lobbyid = nextId.toString().padStart(3, '0');
    cp.exec(command.replace(/%PORT%/g, '65' + lobbyid), {stdio: 'inherit'}, function(err, stderr, stdout) {});
    res(200, 'text/plain', lobbyid);
    nextId++;
  }
  else {
    res(404, 'text/plain', '404 not found');
  }
});
}
