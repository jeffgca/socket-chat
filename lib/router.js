/**

 Router, allows developers to assign handlers 
 to specific messages received from the client. A 
 few things need to be figured out: 
 
  1. How messages are really routed to the client's code
  2. How to sandbox the client's code cleaning
  3. How the client can asynchronously send RESPONSES back when
     it has handled the user's request. (!IMPORTANT!) 

 */ 
 
var sys = require('sys'),
    debug = function(str) {
        sys.puts("(debug) " + str);
    }, 
    counter = 0; 
var routes = {
    'default' : function(payload, callback) {
        debug("default route"); 
        callback({foo : "bar"});
    }
}; 

exports.setHandler = function(event, callback) {
    // @TODO sanitize the types of event and callbacks
    debug("Setting handler: " + event);
    routes[event] = callback; 
}

exports.getHandler = function(event) {
    
}

exports.listHandlers = function() {
    var list = [];
    for (var i in routes) {
        list.push(i); 
    }
    return list; 
}

var _responseHandler = function(payload) {
    debug("Route Response: " + JSON.stringify(payload)); 
}

/** 
 * Handling incoming messages
 */
exports.message = function(event, payload) {
    counter++; 
    if (typeof(routes[event]) == "function") {
        routes[event](payload, _responseHandler);
    } else {
        // do the default 
        routes["default"](payload, _responseHandler); 
    }
}

exports.count = function() {
    return counter; 
}