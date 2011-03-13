/* camp.js: server-side Ajax handler for node.js.
 * Copyright (c) 2011 Thaddee Tyl. All rights reserved.
 */

exports.Camp = (function () {
  var camp = function (action, callback) {
  	exports.Camp.Actions[action] = callback;
  };
  camp.Actions = {};
  
  return camp;
})();

exports.Camp.start = function (port, debug) {
  port = port || 80;
  
  var http = require('http'),
  fs = require('fs'),
  url = require('url'),
  qs = require('querystring');
  
  http.createServer(function(req,res){
    var uri = url.parse (req.url, true);
    var path = uri.pathname;
    var query = uri.query;
    
    try {
      console.log(path);
      if (path.match (/\/$/)) {
        path = path + 'index.html';
      }
      var realpath = '.' + path;
      
      if (/^\/_\//.test (path)) {
        var action = path.slice (3);
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        req.on ('data', function (chunk) {

          /* Parse the chunk (it is an object literal). */
          query = qs.parse (unescape(chunk));
          for (var el in query) {
            try {
              query[el] = JSON.parse (unescape(query[el]));
            } catch (e) {
              console.log ('query[el]: ' + query[el] + ' ' + e);
            }
          }

          /* Launch the defined action. */
          if (exports.Camp.Actions[action]) {
            var resp = JSON.stringify (exports.Camp.Actions[action] (query));
            res.write (resp);
            res.end ();
          } else {
            res.write ('404');
            res.end ();
          }

        });
      
      } else	{
        if (debug) { console.log(path); }
        var src = fs.readFileSync(realpath).toString();	    	
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(src);
        res.end();
      }
    	
    }
    catch(e) {
      res.writeHead(404);
      res.write('404: thou hast finished me!\n');
      if (debug) { res.write(e.toString()); }
      res.end();
    }
  
  }).listen(port);
};
