//packages
var twitter = require('ntwitter');
var express = require('express');
var app     = express();
var server  = require('http').createServer(app),
io          = require('socket.io').listen(server);

//server
var port    = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
server.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/choropleth.html');
});

// app.use("/", express.static(__dirname + '/'));
app.use("/js", express.static(__dirname + '/js/prod'));
app.use("/img", express.static(__dirname + '/img'));
app.use("/css", express.static(__dirname + '/css/prod'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

//twitter
var t = new twitter({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token_key:     process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_TOKEN_SECRET
  });

//change for dev/prod
// app.configure('production', function() {
  //for heroku cedar (cannot use websockets!)
  io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set("close timeout", 10);
  });
// });

//remove extraneous debug statements
io.set('log level', 1);

//create redis client
// var redis   = require('redis');
// var client;
// if (process.env.REDISTOGO_URL) {
//   // TODO: redistogo connection
//   var rtg = require("url").parse(process.env.REDISTOGO_URL);
//   client  = require("redis").createClient(rtg.port, rtg.hostname);
//   client.auth(rtg.auth.split(":")[1]);
// } else {
//   client  = require("redis").createClient();
// }

//state array
// var states      = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","PR"];
//init state data object
// var state_data  = {"AL" : 0,"AK" : 0,"AZ" : 0,"AR" : 0,"CA" : 0,"CO" : 0,"CT" : 0,"DE" : 0,"DC" : 0,"FL" : 0,"GA" : 0,"HI" : 0,"ID" : 0,"IL" : 0,"IN" : 0,"IA" : 0,"KS" : 0,"KY" : 0,"LA" : 0,"ME" : 0,"MD" : 0,"MA" : 0,"MI" : 0,"MN" : 0,"MS" : 0,"MO" : 0,"MT" : 0,"NE" : 0,"NV" : 0,"NH" : 0,"NJ" : 0,"NM" : 0,"NY" : 0,"NC" : 0,"ND" : 0,"OH" : 0,"OK" : 0,"OR" : 0,"PA" : 0,"RI" : 0,"SC" : 0,"SD" : 0,"TN" : 0,"TX" : 0,"UT" : 0,"VT" : 0,"VA" : 0,"WA" : 0,"WV" : 0,"WI" : 0,"WY" : 0,"PR" : 0};

//variables
var write_to_json;
// var json_file   = "../tweets.json";
var file        = "";

var stream = 0;
var tweet_stream;
var num_clients = 0;

io.sockets.on('connection', function (socket) {
  num_clients++;
  console.log("Clients inc: " + num_clients);
  console.log('Stream: ' + stream);

  //first send initial data (array of states)
  // client.mget(states, function(err, reply) {
  //   for (var i = 0; i < reply.length; i++) {
  //       if (String(reply[i]) != 'null') {
  //           state_data[states[i]] = reply[i];
  //       } else {
  //           state_data[states[i]] = 0;
  //       }
  //   }

  //at this point its easier to just reset the states for new connections
  //since we didn't store the points/tweets yet
  //otherwise the # of tweets in each state will be > 0 but
  //the number of total tweets will be off and the number of devices/pie charts won't be in sync

  // for (var i = 0; i < states.length; i++) {
  //   state_data[states[i]] = 0;
  // }

  // var obj = {};
  // obj.state_data = state_data;
  socket.emit("updated_states");

  //check if stream is on
  if (stream === 0) {
    getStream();
    stream = 1;
  }

  socket.on('query', function (data) {
    console.log('query: ' + stream);
    //read to database
    console.log('data: ' + data);
  });

  socket.on('updated_states_received', function (s) {
    console.log('states received for client ' + socket.id);// + ' ' + socket.sessionId);
  });

  socket.on('disconnect', function(){
    io.sockets.emit({ announcement: socket.sessionId + ' disconnected' });
    io.sockets.emit({ announcement: socket.id + ' disconnected' });
    num_clients--;
    console.log("Clients dec: " + num_clients);
  });

});

// var track_words = [""];
var stop_getting_coords = false;

function getStream() {
  t.stream(
    'statuses/filter',
    // { track: track_words },
    {'locations': ['-180','15','19','72']},
    function(stream) {
        tweet_stream = stream;
        stream.on('data', function(tweet) {
            //check if there is place data
            //check if in US
            if (tweet.place && tweet.place.country_code === "US" && tweet.geo) {
                var state = (tweet.place.full_name.split(',')[1]);
                if (state)
                  state = state.trim();
                //assert length
                if (state !== undefined && state !== "US" && state.length == 2) {
                    //get other information
                    var users = tweet.entities.user_mentions;
                    var coord2 = null;
                    // console.log('users: ' + users);
                    if (users[0] !== undefined && users[0] !== null) {
                      var user = users[0];
                      var name = user.screen_name;
                      // console.log('user : ' + name);

                      if (stop_getting_coords) {
                        t.showUser(name, function (err, data) {
                          if (err) {
                            console.log("Error verifying credentials: " + err);
                            process.exit(1);
                            stop_getting_coords = true;
                          } else {
                            var c = data[0].status;
                            if (c !== undefined && c !== null && c.coordinates !== undefined && c.coordinates !== null) {
                              coord2 = c.coordinates.coordinates;
                              console.log('coord: ' + coord2);
                            }
                          }
                        var tweet_data = getTweetInfo(tweet,state,coord2);
                        //if not using database ignore below
                        io.sockets.volatile.emit("send_tweet", tweet_data); //send all required data
                         //check key
                          // client.exists(state, function(error, exists) {
                          //     if(error) {
                          //         console.log('state ERROR: '+error);
                          //     } else if(!exists) {
                          //         client.set(state, 1); //create the key
                          //         console.log("created state: " + state);
                          //         io.sockets.volatile.emit("send_tweet", tweet_data); //send all required data
                          //     } else {
                          //         client.incr(state); //incr
                          //         io.sockets.volatile.emit("send_tweet", tweet_data); //same
                          //     }
                          // });
                        });
                      }
                    } else {
                      var tweet_data = getTweetInfo(tweet,state,coord2);
                      //check key
                      //if not using database ignore below
                      io.sockets.volatile.emit("send_tweet", tweet_data); //send all required data
                      // client.exists(state, function(error, exists) {
                      //     if(error) {
                      //         console.log('state ERROR: '+error);
                      //     } else if(!exists) {
                      //         client.set(state, 1); //create the key
                      //         console.log("created state: " + state);
                      //         io.sockets.volatile.emit("send_tweet", tweet_data); //send all required data
                      //     } else {
                      //         client.incr(state); //incr
                      //         io.sockets.volatile.emit("send_tweet", tweet_data); //same
                      //     }
                      // });
                    }
                }
            }
        });

        stream.on('error', function(tweet) {
            console.log('stream err: ' + tweet);
        });

         stream.on('end', function(tweet) {
            console.log('stream end: ' + tweet);
            stream = 0;
        });

        stream.on('destroy', function(tweet) {
            console.log('stream destroy: ' + tweet);
            stream = 0;
        });
    }
  );
}

function getTweetInfo(tweet, state, coord2) {
  //parse device
  var device  = (tweet.source);
  var revDevice = device.split("").reverse().join("");
  var deviceInfo = "";
  deviceInfo = revDevice.substring(4);
  var arr = deviceInfo.split(">");
  deviceInfo = arr[0];
  deviceInfo = deviceInfo.split("").reverse().join("");

  //split device into 3 categories (android, iphone, other)
  var _device = deviceInfo;
  if(deviceInfo == 'Twitter for Android'){
    _device = 'Android';
  }
  else if(deviceInfo == 'Twitter for iPhone' || deviceInfo == 'iOS'){
    _device = 'iPhone';
  }
  else{
    _device = 'Other';
  }

  //create obj
  var tweet_msg;
  tweet_msg = {
    name:  tweet.user.name,
    screen_name:  tweet.user.screen_name,
    profile_image_url:  tweet.user.profile_image_url_https,
    text:  tweet.text,
    created_at:  tweet.created_at,
    device: _device,
    device_name: deviceInfo,
    coordinates: tweet.coordinates.coordinates,
    coordinates2: coord2,
    place_name: tweet.place.full_name,
    state: state,
    id: tweet.id_str
    // entities: tweet.entities
  };

  return tweet_msg;
}
