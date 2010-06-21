// System
var sys = require("sys"),
url = require('url'),
http = require("http"),
events = require("events"),
path = require("path"),
fs = require('fs');

// Local
require.paths.unshift(__dirname);
require.paths.push(__dirname + '/lib');
var fileutils = require('./vendor/fileutils/fileutils');

function Dump(thing) {
    if (arguments.length > 1) {
        thing = arguments;
    }
    sys.puts(sys.inspect(thing));
}

var io = require('./vendor/Socket.IO-node/lib/socket.io');

// require the router
var router = require('./lib/router');

// socket.io, I choose you
// simplest chat application evar
var buffer = [],
json = JSON.stringify;

send404 = function(res){
	res.writeHead(404);
	res.write('404');
	res.end();
}

var index_html = fs.readFileSync('./index.html');
		
/* Our http server */
server = http.createServer(function(req, res) {
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path) {
    case '/':
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
	res.write(index_html);
	res.end();
        break;

    default:
        if (/\.(js|html|swf)$/.test(path)) {
            try {
		//sys.puts('Got path: ' + path);
                var swf = path.substr( - 4) === '.swf';
                res.writeHead(200, {
                    'Content-Type': swf ? 'application/x-shockwave-flash': ('text/' + (path.substr( - 3) === '.js' ? 'javascript': 'html'))
                });
		
		sys.puts(__dirname + path);
		
		sys.puts(fs.readFileSync(__dirname + path, swf ? 'binary': 'utf8'));
		
                res.write(fs.readFileSync(__dirname + path, swf ? 'binary': 'utf8'), swf ? 'binary': 'utf8');
                res.end();
            } catch(e) {
                send404(res);
            }
            break;
        }

        send404(res);
        break;
    }
});
var buffer = [], json = JSON.stringify;

server.listen(8080);

/* Socket.IO listener */
io.listen(server, {

    onClientConnect: function(client) {
        client.send(json({
            buffer: buffer
        }));
        client.broadcast(json({
            announcement: client.sessionId + ' connected'
        }));
    },

    onClientDisconnect: function(client) {
        client.broadcast(json({
            announcement: client.sessionId + ' disconnected'
        }));
    },

    onClientMessage: function(message, client) {
        var msg = {
            message: [client.sessionId, message]
        };
        buffer.push(msg);
        if (buffer.length > 15) {
            buffer.shift();
        }
        client.broadcast(json(msg));
    }

});

