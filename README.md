[Tweetpleth]
=========

![football](http://i.imgur.com/eqPmeZ2.png)

Serves tweets in realtime:

  - as a population map (# tweets)
  - *added*: as a choropleth (# tweets/1000 people)

for a given search query.

**LAST UPDATE** - Added 'Zen mode' based on the awesome [Tweetping](http://tweetping.net/) viz. Press Esc to go back.

Features
-----------

* shows tweets for given search in real time
* displays device distribution on hover
* keeps a count of tweets per state
* colors map by tweet count and tweet count/1000 people
* plots cities (100 last cities)
* **removed**: draw curves connecting peoples mentions (too many api calls)
* zen mode: no filtering of words, and only shows points. try it in fullscreen! Press Esc to return to normal.

Future
-----------

* figure out how to scale the app based on the rate (fast/slow)
* add back functionality to draw lines for tweets with mentions (@)
* use the database to store popular queries to recommend
* change size of point by some variable (number of tweets in location)
* colorize points by word (if multiple words)
 * Example: Could use football team colors if searching for both teams
* A way to show how often each word is tweeted in comparison (bar chart?)
 * Text analysis (sentiment ex: know if a person likes a certain team)

Background
-----------
Created as a final project for [CS 4460 (Intro to Info Vis)] at [Georiga Tech].

Inspired by Paul Butler's [Visualizing Friendships post](http://on.fb.me/hy6dmb).

The final idea wasn't fully established until pretty late in the semester, so i'm sorry if the code isn't understandable. Took about 2-3 weeks?

I just spent the past few days after the school semester putting it online, fixing bugs, adding some features, and trying to put it on github with this readme.

Examples of Use (Count)
-----------

![voice](http://i.imgur.com/1459q.png)

*showing timezones*

![tumblr](http://i.imgur.com/yd148.png)

*when tumblr was down*

![connections](http://i.imgur.com/seOML.png)

*showing connections on tweets with mentions (@) using yellow lines*

Population Density vs. Count
-
![density](http://i.imgur.com/SvCgGdE.png)
![count](http://i.imgur.com/v35rdSk.png)

To get a real choropleth, you would want to divide each states # of tweets by their area in sq m or actual population.

The map by count shows colors better earlier but makes it so Texas and California always stand out even though they are larger states.

![zen](http://i.imgur.com/MgMUmcQ.png)

*zen mode*

Tech
-----------

* Hosting: [Heroku] - using its great feature of 750 free dyno-hours per app
* Server: [node.js] - to get tweets
* Web Server: [Express] - to serve the website
* Connection: [socket.io] - to send messages between client and server

* JS
    * [d3.js] - amazing visualization library (now v3!)
    * [socket.io]
    * [timeago] - plugin for jQuery
    - [jQuery]
    - [Twitter Widgets]
* CSS
    - [Twitter Bootstrap]
    - reset.css
* Node packages
    - [ntwitter]
    - [express]
    - [socket.io]
* Could be used
    - [redis] - could be used to store data, but the free heroku redis database is only 5mb.

Installation
--------------

1. Clone the repo
2. Make sure dependencies are installed (node, npm, node packages)
3. Create a developer twitter account if needed
4. Get the account's API keys
5. Use environment variables
 - create .env and local.env in the root folder
     - `CONSUMER_KEY=XXX`
     - `CONSUMER_SECRET=XXX`
     - `ACCESS_TOKEN=XXX`
     - `ACCESS_TOKEN_SECRET=XXX`
 - replace server.js code with keys
     - `consumer_key:process.env.CONSUMER_KEY`
     - `consumer_secret: process.env.CONSUMER_SECRET`
     - `access_token_key:process.env.ACCESS_TOKEN`
     - `access_token_secret: process.env.ACCESS_TOKEN_SECRET`
6.  - Run local
        -  run `node server.js` for
        - or run (with .env)`foreman start -e local.env` for local testing using heroku
    - Run production (for Heroku)
        - upload to heroku with `git push heroku master`
7.  - View local
        - go to `http://localhost:5000` on your browser
    - Run production (for Heroku)
        - go to the created heroku website.

How the Idea formed
--------------

We wanted to try Facebook at first but soon realized most information on Facebook was private (so you would only be able to get data on user profile, name, country id, and id (when they joined facebook).

Thus we looked into Twitter and found the rest and streaming APIs. I realized that a real-time map might be more interesting, so it was a perfect time to try out some new technologies like node.js.

We found that you could search by keyword/location. The tweets sent back had a lot of information including # followers, friends, location, text, device. We thought it would be cool to know what people were tweeting from and where. Another question was who were the people they were connecting to.

-tbc.

License
-

MIT

  [node.js]: http://nodejs.org
  [Twitter Bootstrap]: http://twitter.github.com/bootstrap/
  [jQuery]: http://jquery.com
  [express]: http://expressjs.com
  [timeago]: http://timeago.yarp.com/
  [socket.io]: http://socket.io/
  [d3.js]: http://d3js.org/
  [redis]: http://redis.io/
  [Twitter Widgets]: https://twitter.com/about/resources/buttons#tweet
  [ntwitter]: https://github.com/AvianFlu/ntwitter
  [Tweetpleth]: http://tweetpleth.herokuapp.com
  [Heroku]: http://heroku.com
  [CS 4460 (Intro to Info Vis)]: http://cs4460infovis.wordpress.com/
  [Georiga Tech]: http://www.gatech.edu/
