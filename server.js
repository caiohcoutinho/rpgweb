//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    path    = require("path"),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    _ = require("underscore"),
    MongoClient = require('mongodb').MongoClient;

var url = "mongodb://rpgweb:zJeC5bJ7NTSs@ds119091.mlab.com:19091/rpgweb";

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());
    
app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || 8080;

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/heart.png', function (req, res) {
	var img = fs.readFileSync(__dirname+'/heart.png');
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
});

app.get('/hero', function(req, res){
    res.setHeader('Content-Type', 'application/json');
	MongoClient.connect(url, function(err, db) {
	  var statusCollection = db.collection('status');
	  statusCollection.find({}).toArray(function(err, docs) {
	    var currentStatus = _.max(docs, "index");	    
    	res.send(JSON.stringify(currentStatus));
	    db.close();
	  });
	});
});

app.get('/user', function(req, res){
    var email = req.query.user;
    res.setHeader('Content-Type', 'application/json');
    var user = "invalid";
    if(email == 'caiohcoutinho@gmail.com'){
    	user = "Caio";
    }
    if(email == "augustosarao@gmail.com"){
    	user = "Augusto";
    }
    if(email == "fgusmao230@gmail.com"){
    	user = "Felipe";
    }
    res.send(JSON.stringify({user: user}));
});

app.get('/answers', function(req, res){
    res.setHeader('Content-Type', 'application/json');
	MongoClient.connect(url, function(err, db) {
	  var statusCollection = db.collection('answers');
	  statusCollection.find({}).toArray(function(err, docs) {
    	res.send(JSON.stringify(docs));
	    db.close();
	  });
	});
});

app.post('/answers', function(req, res){
    res.setHeader('Content-Type', 'application/json');
    var update = {};
    update[req.body.user] = req.body.answer;
    update.index = req.body.chapter;
	MongoClient.connect(url, function(err, db) {
  		db.collection('answers').update(
  			{
  				index: { $eq: req.body.chapter }
  			},
  			update,
  			{
  				upsert: true,
  			},
  			function(){
  				db.close();
  				res.send("success");
  			}
  		);
	});
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port);
console.log('Server running on port %s', port);

module.exports = app ;