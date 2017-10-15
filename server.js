//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    path    = require("path"),
    fs = require('fs'),
    _ = require("underscore"),
    MongoClient = require('mongodb').MongoClient;

var url = "mongodb://rpgweb:zJeC5bJ7NTSs@ds119091.mlab.com:19091/rpgweb";
    
app.engine('html', require('ejs').renderFile);

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

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


// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;