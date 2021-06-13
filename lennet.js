module.exports = {
  registerRequestHandler: function(id, handler) {
    requestHandlers[id] = handler;
  },
  setServerInstance: function(instance) {
    serverInstance = instance;
  },
  init: function(port) {
    var http = require('@thecoder08/http');
    var requestHandlers = {};
    var serverInstance = function() {};
    http.server(port, function(req, res, redirect) {
      if (req.pathname == '/getlennetlobbyid') {
        var letter1 = String.fromCharCode(Math.round(Math.random() * 26) + 64);
        var letter2 = String.fromCharCode(Math.round(Math.random() * 26) + 64);
        var letter3 = String.fromCharCode(Math.round(Math.random() * 26) + 64);
        var letter4 = String.fromCharCode(Math.round(Math.random() * 26) + 64);
        var id = letter1.concat(letter2, letter3, letter4);
        serverInstance(id);
        res(200, 'text/plain', id);
      }
      else {
        if (requestHandlers.hasOwnProperty(req.query.lennetlobbyid)) {
          requestHandlers[req.query.lennetlobbyid](req, res);
        }
        else {
          res(404, 'text/plain', '404 lobby not found')
        }
      }
    });
  }
}
