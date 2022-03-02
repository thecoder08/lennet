# Lennet
A framework that allows you to generate IDs for your multiplayer games and start instances of the server, so that your users don't need to port forward and you don't need to rewrite much code.

Just run
```javascript
var lennet = require('@thecoder08/lennet');
lennet.init(25568, 'node server.js %PORT% extra args');
```
to start lennet.

Lennet will listen for requests on a port that you specify and start server instances with the command that you specify. It will replace %PORT% with the port the run the instance on (which starts at 65000 and goes to 65535).

It will respond to getlennetlobbyid requests with the last three digits of the port that the server is running on (the "Lobby ID"). You can get the port by adding a 65 to the beginning of the lobby ID.

To use Lennet, get a cloud hosting server (like the free plan from GCP) and open ports 65000-65535, as well as whatever port Lennet is listening for requests on.
