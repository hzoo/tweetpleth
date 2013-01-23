$(document).ready(function() {
    $('input[type=text]').keypress(function (event) {
        if (event.keyCode == '13') { //jquery normalizes the keycode
            event.preventDefault(); //avoids default action
            // $(this).parent().find('input[type=submit]').trigger('click');
            $('#search_btn').trigger('click');
        }
    });
});

var data,
data_area,
width      = 960,
height     = 490,
projection = d3.geo.albersUsa(),
path       = d3.geo.path().projection(projection),
density    = true,
svg = d3.select("#chart")
  .append("svg:svg")
  // .call(d3.behavior.zoom()
  //   .scaleExtent([1,3])
  //   .on("zoom", redraw))
  .append("svg:g");

var myMouseOverFunction = function(d) {
  var text = d3.select(this);

  d3.select(".infobox").style("display", "block");
  var state, loc;

  if (d.state) {
    loc = d.place_name;
    state = d.state;
  } else if (!d.place_name) {
    loc = d.abbr;
    state = d.abbr;
  }
  else {
    loc = d.place_name;
    state = d.abbr;
  }
    // console.log('update pie');
  updatePieChart(state);

   d3.select(".info_city").html(loc + ": " +
    "<br>" + data[state]  + " tweets");
};

var w = 100,
  h = 100,
  r = 50;

var vis = d3.select('.infobox')
        .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .append("svg:g")
            .attr("transform", "translate(" + r + "," + r + ")");

var arc = d3.svg.arc()
    .outerRadius(r);

var pie = d3.layout.pie()
    .value(function(d) { return d.value; })
    .sort(null);

function updatePieChart(d) {
  var state_abbr = d;
  var  color = d3.scale.category20c();

    var newdata =  [{"label":"iPhone","value":devices[state_abbr][0].value},
                      {"label":"Android","value":devices[state_abbr][1].value},
                      {"label":"Other","value":devices[state_abbr][2].value}];
    if (newdata[0].value === 0 && newdata[1].value === 0 && newdata[2].value === 0) {
       d3.select(".infobox svg").style("display", "none");
       d3.select('.infobox').transition().style('width','50px').style('height','40px');
       d3.select(".info_devices").html('');
    } else {
      d3.select(".infobox svg").style("display", "inline");
      d3.select('.infobox').transition().style('width','190px').style('height','95px');
      d3.select(".info_devices").html(
      "<span>" + "iPhone: " + devices[state_abbr][0].value + "</span><br>" +
      "<span>" + "Android: " + devices[state_abbr][1].value + "</span><br>" +
      "<span>" + "Other: " + devices[state_abbr][2].value + "</span>");

        var arcs = vis.selectAll("g.slice")
            .data(pie(newdata));

        var entering = arcs.enter()
                .append("svg:g")
                    .attr("class", "slice");

            entering.append("svg:path")
                    .attr("fill", function(d, i) {
                      return color(i);
                    })
                    // .attr('class','slice_path')
                    .attr("d", arc)
                    .each(function(d) { this._current = d; });

           entering.append("svg:text")
                    .attr("transform", function(d) {
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return "translate(" + arc.centroid(d) + ")";
                })
                // .attr('class','slice_text')
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                  if (devices[state_abbr][i].value === 0)
                    return '';
                  else
                    return devices[state_abbr][i].label;
                 });

                arcs.exit().remove();

                arcs.select('path')
                    .transition()
                    .attr("fill", function(d, i) {
                      // console.log('hi: ' + i + ' ' + color(i));
                      return color(i); } )
                    // .attr("d", arc);
                    .attrTween("d", arcTween);

                arcs.select('text')
                  .transition()
                  .attr("transform", function(d) {
                    d.innerRadius = 0;
                    d.outerRadius = r;
                    return "translate(" + arc.centroid(d) + ")";
                })
                .text(function(d, i) {
                  if (devices[state_abbr][i].value === 0)
                    return '';
                  else
                    return devices[state_abbr][i].label;
                 });
          }
}

function arcTween(a) {
  // console.log(this);
  // console.log(this._current);
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

var myMouseOutFunction = function(d) {
  var text = d3.select(this);
  d3.select(".infobox").style("display", "none");
};

var myMouseMoveFunction = function() {
  var infobox = d3.select(".infobox");
  var coord = d3.mouse(this);
  infobox.style("left", coord[0] + (window.innerWidth-940)/2 + -20 +  "px" );
  infobox.style("top", coord[1] + 22 + "px");
};

// function redraw() {
//   svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
// }

var states = svg.append("g")
    .attr("class", "states");

var total_tweets = 0;
var tweets_html = [];
var points_html = [];
var paths_html = [];
var devices = get_reset_devices();
var devices_total = {"iPhone": 0, "Android": 0, "Other": 0};
var words_empty = true;

d3.select(".infobox").style("display", "none");

var num_tweets_display = getNumTweetsToDisplay();
function getNumTweetsToDisplay() {
  if (window.innerHeight-640 <= 0)
    return 3;
  else
    return parseInt((window.innerHeight-640)/48,10)+3;
}

var w = 960, //tweet width
      h = 48; //tweet height
var x = d3.scale.linear()
   .domain([0, 1])
   .range([0, w]);

var y = d3.scale.linear()
   .domain([0, num_tweets_display])
   .rangeRound([0, h*num_tweets_display-1]);

window.onresize = function() {
    // console.log(window.innerHeight);
    num_tweets_display = getNumTweetsToDisplay();
    y.domain([0, num_tweets_display]).rangeRound([0, h*num_tweets_display-1]);
    chart.attr("height", h * num_tweets_display - 1);
    // console.log(num_tweets_display);
};

var chart = d3.select(".tweets_container").append("svg")
     .attr("class", "chart")
     .attr("width", w)
     .attr("height", h * num_tweets_display - 1);

var color = d3.scale.linear()
    .range(["rgb(247,251,255)","rgb(8,48,107)"]);

//socket.io
// var ip = 'localhost';
// var socket = io.connect('http://' + ip + ':5000');
var host = window.location.hostname;
// console.log(host);
if (host === "localhost") host = "'http://localhost:5000";
// console.log(host);
var socket = io.connect(host);
var received = 0;

socket.on('updated_states', function () {
  // console.log("updated_states");
  reset_chart();
  // console.log("states received");
  socket.emit('updated_states_received', {});
});

function reset_chart() {
  received = 1;

  //time started
  $('#time').attr("title", iso8601(new Date()));
  jQuery("#time").timeago();

  //reset
  tweets_html = [];
  updateTweets([]);
  points_html = [];
  updatePoints([]);
  paths_html = [];
  updatePaths([],[]);
  d3.timer.flush();

  data = get_reset_states();
  data_area = get_reset_states();
  devices = get_reset_devices();
  total_tweets = 0;
  devices_total = {"iPhone": 0, "Android": 0, "Other": 0};

  d3.select('#total_tweets').text('(' + 0 + ')');

  legend
    .transition()
    .duration(1000)
    .text(0);

  if (density) {
    color.domain([0, d3.max(d3.values(data_area))]);
  }
  else {
    color.domain([0, d3.max(d3.values(data))]);
  }

  states.selectAll("path")
    .transition()
    .duration(500)
    .style("fill", function(d) {
      return color(0);
    });
}

var words = [];

var words_count = [];

function wordMatches(text,words) {
  //regex
  // var words_regex = "sr|ad|bob";
  // var patt= new RegExp(words_regex,"gi");
  // var myArray;
  // while ((myArray = patt.exec(s)) !== null)
  // {
  //     var msg = "Found " + myArray[0] + ".  ";
  //     msg += "Next match starts at " + patt.lastIndex;
  //     console.log(msg);
  // }

  // TWITTER
  // twitter
  // "Twitter"
  // twitter.
  // #twitter
  // @twitter
  // http://twitter.com

  if (words.length === 0) return false;
  for (var i = 0;i < words.length; i++) {
      var data_lc = text.toLowerCase();
      var words_lc = words[i].toLowerCase();
      if (data_lc.indexOf(words_lc + " ") !== -1 || data_lc.indexOf(words_lc + ".") !== -1 || data_lc.indexOf("#" + words_lc) !== -1) {
          words_count[i]++;
          var newtext = text.replace(words[i],"<span class='query'>"+words[i]+"</span>");
          return [true,newtext];
      }
  }
  return false;

  // var words_regex = "sr|ad|bob";
  // for (var i = 0; i < words.length; i++ ) { words_regex += words[i]+ '|'; }
  // var patt= new RegExp(words_regex,"gi");
  // return patt.test(words_regex);
}

socket.on('send_tweet', function (sent_data) {
  // console.log('got tweet');
  var wordContained = wordMatches(sent_data.text,words);
  if (received && wordContained[0] == true) {
    for (var i = 0;i < words.length; i++) {
      d3.select('#words_counts').selectAll('div')
        .text(function(d,i) {
          return words_count[i];
        });
    }

    var state = sent_data.state;

    if (data[state] !== undefined) {
      data[state]++;
      data_area[state] += 1/area[state];
    }

    total_tweets++;

    if (density) {
      color.domain([0, d3.max(d3.values(data_area))]);
    }
    else {
      color.domain([0, d3.max(d3.values(data))]);
    }

    if (density) {
      legend
        .transition()
        .duration(1000)
        .text(d3.max(d3.values(data_area)).toFixed(3));
    }
    else {
      legend
        .transition()
        .duration(1000)
        .text(d3.max(d3.values(data)));
    }

    states.selectAll("path")
        .on("mouseover", function(d) {
          if (d3.event.target.tagName == "path")
            myMouseOverFunction(d);
        })
        .on("mouseout", function(d) {
          if (d3.event.target.tagName == "path")
            myMouseOutFunction(d);
        })
        .transition()
          .duration(500)
          .style("fill", function(d) {
            // console.log(states_fill);
            if (states_fill) {
              if (density) {
                return color(data_area[d.abbr]);
              }
              else {
                return color(data[d.abbr]);
              }
            }
            else {
              return 'white';
            }
          });

    if (sent_data.device == 'iPhone') {
      devices[sent_data.state][0].value++;
      devices_total['iPhone']++;
    }
    else if (sent_data.device == 'Android') {
      devices[sent_data.state][1].value++;
      devices_total['Android']++;
    }
    else {
      devices[sent_data.state][2].value++;
      devices_total['Other']++;
    }

    d3.select('#total_tweets').text('(' + total_tweets + ') ');
    d3.select('#apple_tweets').text(": " + devices_total['iPhone']);
    d3.select('#android_tweets').text(": " + devices_total['Android']);
    d3.select('#other_tweets').text(": " + devices_total['Other']);
    // console.log(devices_total);

    //show tweets in realtime
    if (!words_empty) {
      if (tweets_html.length >= num_tweets_display) {
        tweets_html.shift();
      }
      sent_data.text = wordContained[1];
      tweets_html.push(sent_data);
      updateTweets(tweets_html);
    }

    if (points_html.length >= 100) {
      points_html.shift();
    }
    points_html.push({
      id: sent_data.id,
      abbr: sent_data.state,
      place_name: sent_data.place_name,
      coord: projection(sent_data.coordinates)
    });
    updatePoints(points_html);

    if (sent_data.coordinates2) {
      console.log(sent_data.coordinates2);
      if (paths_html.length >= 20) { //yea?
        paths_html.shift();
      }
      paths_html.push({
        coord: projection(sent_data.coordinates),
        id: sent_data.id
      });
      updatePaths(paths_html,projection(sent_data.coordinates2));
    }
    d3.timer.flush();
  }
});

function updateTweets(data) {
    var text = chart.selectAll('.tweet')
        .data(data, function(d) { return d.text; });

    text.enter().insert("svg:foreignObject")
      .attr("x", function(d, i) { return -0.5; })
      .attr("y", function(d, i) { return y(i + 1) - 0.5; })
      .attr("width", w)
      .attr("height", h)
      // .attr("class", function(d,i) { return 'tweet tweet' + i;})
      .on("mouseover",function(d,i) {
        // if (d3.event.target.tagName == "foreignobject") {
          $(this).css('background-color', '#D3D3D3');
          d3.select('#tweet-' + d.id)
            .transition()
            .duration(500)
            .attr("r",15)
            .style("fill","yellow");
        // }
      })
      .on("mouseout",function(d,i) {
        // if (d3.event.target.tagName == "foreignobject") {
          $(this).css('background-color', 'white');
          d3.select('#tweet-' + d.id)
            .transition()
            .duration(500)
            .attr("r",5)
            .style("fill","#F2762E");
        // }
      })
      .append("xhtml:body")
      .html(function(d) {
                var device, image;
                if (d.device_name == "Twitter for Android") {
                  device = '/img/android_black.gif';
                   image = '<img class=\'device_image\' height=\'14\' width=\'12\' src=\'' + device+ '\'/>';
                } else if (d.device_name == "Twitter for iPhone") {
                  device = '/img/apple_black.gif';
                   image = '<img style=\'margin-top: -4px;\' class=\'device_image\' height=\'14\' width=\'12\' src=\'' + device+ '\'/>';
                } else if (d.device_name == "Twitter for Windows Phone") {
                  device = '/img/windows_black.gif';
                  image = '<img class=\'device_image\' height=\'14\' width=\'12\' src=\'' + device+ '\'/>';
                } else {
                  device = '/img/generic_black.png';
                  image = '<img class=\'device_image\' height=\'14\' width=\'12\' src=\'' + device+ '\'/>';
                }

                return '<img class=\'tweet_image\' height=\'48\' width=\'48\' src=\'' + d.profile_image_url + '\' alt=\'' + d.name + '\'/>'
                + '<div class="tweet_info">'
                + '<a class=\'user_link\' href=\'' + 'https://twitter.com/' + d.screen_name + '\' target="_blank">'
                + '<span class =fullname>' + d.name + "</span>"
                + '<span>&nbsp;‏</span>'
                + '<span class       =screenname>' + "@" + d.screen_name + " </span>"
                + '</a>'
                + '<span>&nbsp;‏</span>'
                + '<img src=\'/img/geo.png\'>'
                + '<span class       =place_name>' + ' from ' + d.place_name + " </span>"
                + '<span>&nbsp;‏</span>'
                + '<span class       =device_name>' + 'using ' + d.device_name + " </span>"
                + image
                // + '<span class=\'timeago\'> ' + jQuery.timeago(new Date(Date.parse(d.created_at)).toLocaleString().substr(0, 16))  + '</span>'
                + '<span class =\'intents\'>'
                + '<a href=\'https://twitter.com/intent/tweet?in_reply_to=' + d.id + '\' class=\'embed_text\' title=\'Reply\'>'
                + '<img style=\'margin-top: -4px;\' class=\'intents_image\' height=\'\' width=\'\' src=\'' + "/img/reply.png"+ '\'/>'
                + '‏Reply</a>'
                + '<span>&nbsp;</span>'
                + '<a href=\'https://twitter.com/intent/retweet?tweet_id=' + d.id+ '\' class=\'embed_text\' title=\'Retweet\'>'
                + '<img style=\'margin-top: -4px;\' class=\'intents_image\' height=\'\' width=\'\' src=\'' + "/img/retweet.png"+ '\'/>'
                + '‏Retweet</a>'
                + '<span>&nbsp;‏</span>'
                + '<a href=\'https://twitter.com/intent/favorite?tweet_id=' + d.id+ '\' class=\'embed_text\' title=\'Favorite\'>'
                + '<img style=\'margin-top: -4px;\' class=\'intents_image\' height=\'\' width=\'\' src=\'' + "/img/favorite.png"+ '\'/>'
                + '‏Favorite</a>'
                + '</span>'
                + '<p class       =text>' + d.text + " </p>"
                + '</div>';
      })
    .transition()
      .duration(1000)
    .attr("y", function(d, i) { return y(i) - 0.5; });

  text.on("mouseover",function(d,i) {
    //console.log(d3.event.target.tagName); //span/img/p
    // if (d3.event.target.tagName == "foreignobject") {
      $(this).css('background-color', '#D3D3D3');
      d3.select('#tweet-' + d.id)
        .transition()
        .duration(250)
        .attr("r",15)
        .style("fill","yellow");

      var infobox = d3.select(".infobox");
      var x = parseInt(d3.select('#tweet-' + d.id).attr("cx"),10) + (window.innerWidth-940)/2 + -20;
      var y = parseInt(d3.select('#tweet-' + d.id).attr("cy"),10) + 22;
      infobox.style("left",  x+"px" );
      infobox.style("top",  y+ "px");
        myMouseOverFunction(d);
    // }
  })
  .on("mouseout",function(d,i) {
    // console.log(d3.event.target.tagName);
    // if (d3.event.target.tagName == "foreignobject") {
      $(this).css('background-color', 'white');
      d3.select('#tweet-' + d.id)
        .transition()
        .duration(500)
        .attr("r",5)
        .style("fill","#F2762E");
         myMouseOutFunction(d);
    // }
  })
  .transition()
      .duration(1000)
    .attr("class", function(d,i) { return 'tweet tweet' + i;})
    .attr("y", function(d, i) { return y(i) - 0.5; });

  text.exit()
      .transition()
      .duration(100)
    .attr("y", function(d, i) {
        //reset
        $(this).css('background-color', 'white');
        d3.select('#tweet-' + d.id)
          .transition()
          .duration(500)
          .attr("r",5)
          .style("fill","#F2762E");

          return y(i - 1) - 0.5;
        })
      .remove();
}

function updatePoints(data) {
  var text = svg.selectAll('circle')
        .data(data, function(d) { return d.id; });

    text.enter().insert("svg:circle")
      .attr("cx", function(d, i) { return d.coord[0]; })
      .attr("cy", function(d, i) { return d.coord[1]; })
      .attr("r", 0)
      .style("opacity", 0)
      .style("fill", 'yellow')
      .attr('id', function(d,i){ return 'tweet-' + d.id;})
    .transition()
      .duration(500)
      .attr("r",15)
      .style("opacity", 0.5)
    .transition()
      .delay(500)
      .duration(500)
      .attr("r",5)
      .style("fill","#F2762E");

    text.on("mouseover",function(d,i) {
      if (d3.event.target.tagName == "circle") {
        d3.select(this).transition()
        .duration(500)
        .attr("r",15)
        .style("fill", 'yellow');
        myMouseOverFunction(d);
      }
    })
    .on("mouseout",function(d,i) {
      if (d3.event.target.tagName == "circle") {
        d3.select(this).transition()
        .duration(500)
        .attr("r",5)
        .style("fill","#F2762E");
        myMouseOutFunction(d);
      }
    });

  text.exit().transition()
      .duration(1000)
    .style("opacity", 0)
      .remove();

    //   var path = svg.selectAll('.link')
    //   .data(data, function(d) { return d.id; });

    //   path.enter().append('svg:path')
    //   .attr('class','link')
    //   .attr("d", function(d) {
    //     var x2 = parseInt(Math.random()*300+300);
    //     var y2 = parseInt(Math.random()*300+300);
    //     var dx = d.coord[0] - x2,
    //         dy = d.coord[1] - y2,
    //         dr = Math.sqrt(dx * dx + dy * dy);
    //     return "M" + d.coord[0] + "," + d.coord[1] + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2;
    //   })
    //   .style("opacity", 0)
    // .transition()
    //   .duration(500)
    //   .style("opacity", 0.7);

    // path.exit().transition()
    //     .duration(1000)
    //   .style("opacity", 0)
    //     .remove();
}

function updatePaths(data, coord2) {
      // console.log(coord2);
      // console.log(coord2[0]);
      // console.log(coord2[1]);

      var path = svg.selectAll('.link')
      .data(data, function(d) { return d.id; });

      path.enter().append('svg:path')
      .attr('class','link')
      .attr("d", function(d) {
        // var x2 = parseInt(Math.random()*300+300);
        // var y2 = parseInt(Math.random()*300+300);
        var dx = d.coord[0] - coord2[0],
            dy = d.coord[1] - coord2[1],
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.coord[0] + "," + d.coord[1] + "A" + dr + "," + dr + " 0 0,1 " + coord2[0] + "," + coord2[1];
      })
      .style("opacity", 0)
    .transition()
      .duration(500)
      .style("opacity", 0.7);

    path.exit().transition()
        .duration(1000)
      .style("opacity", 0)
        .remove();
}

d3.json("./js/us-states-abbr.json", function(json) {
  states.selectAll("path")
      .data(json.features)
    .enter().append("path")
      .attr("d", path)
      .attr("id", function(d) { return d.abbr;})
      .attr("class", "state")
      .on("mousemove", myMouseMoveFunction);
});

var gradient = chart.append("svg:defs")
  .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%")
    .attr("spreadMethod", "pad");

gradient.append("svg:stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgb(247,251,255)")
    .attr("stop-opacity", 1);

gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgb(8,48,107)")
    .attr("stop-opacity", 1);

svg.append("svg:rect")
    .attr("x", 895)
    .attr("y", 200)
    .attr("width", 30)
    .attr("height", 100)
    .style("fill", "url(#gradient)");

var caption_toggle = svg.append("svg:text")
    .attr("x", 870)
    .attr("y", 196)
    .text("tweets/1k ppl");

svg.append("svg:text")
    .attr("x", 884)
    .attr("y", 318)
    .text("0 tweets");

var legend = svg.append("svg:text")
    .attr("x", 905)
    .attr("y", 182);

$("#search_btn").click(function() {
  if ($("#words").val() === "") {
    console.log('#search has no input');
    words_empty = true;
    return true;
  }
  else {
    words_empty = false;
    //check input by removing special characters and trim spaces
    words = $("#words").val().trim().replace(/[^a-z0-9\.,#]/gi,'').split(',');

    console.log(words);

    var wordcounts = d3.select('#words_counts');

    var word_div = wordcounts.selectAll('div')
      .data(words);

    word_div.enter()
      .append('div')
      .text(function(d){return d;});

    word_div.exit().remove();

    console.log('#search input: ' + words);
    socket.emit('query', words);
    return false;
  }
})

$("#reset_btn").click(function() {
  if ($("#words").val() === "") {
    console.log('#reset has no input');
    words_empty = true;
    return true;
  }
  else {
    words_empty = false;
    //check input by removing special characters and trim spaces
    words = $("#words").val().trim().replace(/[^a-z0-9\.,#]/gi,'').split(',');

    console.log('#reset input: ' + words);
    reset_chart();
    socket.emit('query', words);
    return false;
  }
});

var states_fill = true;

// $('.switch_view').click(function() {
//   // console.log('click: ' + states_fill);
//     if (states_fill) {
//       states_fill = false;
//     } else {
//       states_fill = true;
//     }
//  // console.log('click: ' + states_fill);
//     states.selectAll("path")
//       .transition()
//         .duration(500)
//         .style("fill", function(d) {
//           if (states_fill) {
//             if (density) {
//               return color(data_area[d.abbr]);
//             }
//             else {
//               return color(data[d.abbr]);
//             }
//           }
//           else {
//             return 'white';
//           }
//         });
// });

$('#fill_toggle').click(function() {
    if (density) {
      $(this).text("Count");
      density = false;
      caption_toggle.text("tweets").attr("x", 890);
      legend.text(d3.max(d3.values(data))).attr("x", 902);
      color.domain([0, d3.max(d3.values(data_area))]);
    } else {
      $(this).text("Density");
      density = true;
      caption_toggle.text("tweets/1k ppl").attr("x", 870);
      legend.text(d3.max(d3.values(data_area)).toFixed(3)).attr("x", 895);
      color.domain([0, d3.max(d3.values(data))]);
    }
    states.selectAll("path")
      .transition()
        .duration(500)
        .style("fill", function(d) {
          if (density) {
            return color(data_area[d.abbr]);
          }
          else {
            return color(data[d.abbr]);
          }
        });
});

var iso8601 = function (date) {
  return date.getUTCFullYear() +
    "-" + zeropad(date.getUTCMonth()+1) +
    "-" + zeropad(date.getUTCDate()) +
    "T" + zeropad(date.getUTCHours())+
    ":" + zeropad(date.getUTCMinutes()) +
    ":" + zeropad(date.getUTCSeconds()) + "Z";
};

var zeropad = function (num) {
  return ((num < 10) ? '0' : '') + num;
};

var area = {"AL":4822.023,"AK":731.449,"AZ":6553.255,"AR":2949.131,"CA":38041.430,"CO":5187.582,"CT":3590.347,"DE":917.092,"DC":632.323,"FL":19317.568,"GA":9919.945,"HI":1392.313,"ID":1595.728,"IL":12875.255,"IN":6537.334,"IA":3074.186,"KS":2885.905,"KY":4380.415,"LA":4601.893,"ME":1329.192,"MD":5884.563,"MA":6646.144,"MI":9883.360,"MN":5379.139,"MS":2984.926,"MO":6021.988,"MT":1005.141,"NE":1855.525,"NV":2758.931,"NH":1320.718,"NJ":8864.590,"NM":2085.538,"NY":19570.261,"NC":9752.073,"ND":699.628,"OH":11544.225,"OK":3814.820,"OR":3899.353,"PA":12763.536,"PR":3667.084,"RI":1050.292,"SC":4723.723,"SD":833.354,"TN":6456.243,"TX":26059.203,"UT":2855.287,"VT":626.011,"VA":8185.867,"WA":6897.012,"WV":1855.413,"WI":5726.398,"WY":576.412};

function get_reset_states() {
  return {"AL" : 0,"AK" : 0,"AZ" : 0,"AR" : 0,"CA" : 0,"CO" : 0,"CT" : 0,"DE" : 0,"DC" : 0,"FL" : 0,"GA" : 0,"HI" : 0,"ID" : 0,"IL" : 0,"IN" : 0,"IA" : 0,"KS" : 0,"KY" : 0,"LA" : 0,"ME" : 0,"MD" : 0,"MA" : 0,"MI" : 0,"MN" : 0,"MS" : 0,"MO" : 0,"MT" : 0,"NE" : 0,"NV" : 0,"NH" : 0,"NJ" : 0,"NM" : 0,"NY" : 0,"NC" : 0,"ND" : 0,"OH" : 0,"OK" : 0,"OR" : 0,"PA" : 0,"RI" : 0,"SC" : 0,"SD" : 0,"TN" : 0,"TX" : 0,"UT" : 0,"VT" : 0,"VA" : 0,"WA" : 0,"WV" : 0,"WI" : 0,"WY" : 0,"PR" : 0};
}

function get_reset_devices() {
  return {"AL" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "AK" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "AZ" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "AR" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "CA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "CO" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "CT" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "DE" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "DC" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "FL" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "GA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "HI" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "ID" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "IL" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "IN" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "IA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "KS" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "KY" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "LA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "ME" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MD" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MI" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MN" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MS" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MO" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "MT" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NE" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NV" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NH" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NJ" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NM" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NY" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "NC" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "ND" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "OH" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "OK" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "OR" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "PA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "RI" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "SC" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "SD" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "TN" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "TX" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "UT" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "VT" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "VA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "WA" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "WV" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "WI" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "WY" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}],
                            "PR" : [{"label":"iPhone","value":0},{"label":"Android","value":0},{"label":"Other","value":0}]
                          };
}
