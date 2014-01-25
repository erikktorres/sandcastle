
var hakken = require('hakken');
var defaults = require('../package.json');
var urlize = require('nurlize');

function middle (req, res, next) {
  next( );
}

function getServerHost (opts, server) {
  var parts = urlize.valid(server.url);
  var host = parts[1];
  var scheme = parts[0];
  if (opts.scheme || opts.host || opts.port) {
    host =  urlize((opts.scheme || scheme),
                  [ opts.host   || host.split(':')[0]
                  , opts.port ].join(':')).toString( );
  }
  return host;
}

module.exports = function configure (opts, server) {
  var coordinator = {
      host: opts.coordinator || 'localhost'
  };
  console.log("URLIZE SETUP hakken", parts, server.url);
  var description = {
      service: opts.service || defaults.name
  };
  var discover = [ ];
  if (opts.discover) {
    var t = typeof opts.discover;
    switch(t) {
      case 'Function':
        discover = opts.discover(opts, server);
        break;
      default:
        discover = opts.discover;
        break;
    }
  }

  function install (opts, server) {
    // server.hakken = hakken(coordinator).client.make( );
    var client = hakken(coordinator).client.make( );
    var url = getServerHost(opts, server);
    var parts = urlize.valid(url);
    description.host = parts[1];
    description.protocol = parts[0].replace('://', '');
    client.publish(description);
    server.hakken = client;
    server.toServer = toServer;
  }

  function toServer(name) {
    var watch = server.hakken.watchRandom(name);
    watch.start( );
    return watch;
  }

  return install;

};

