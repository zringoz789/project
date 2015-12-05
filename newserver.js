var http = require('http');
var url = require('url');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongodbURL = 'mongodb://restaurantdb123:asd123456asd@ds057944.mongolab.com:57944/restaurants';
var mongoose = require('mongoose');
var MONGODBURL = 'mongodb://restaurantdb123:asd123456asd@ds057944.mongolab.com:57944/restaurants';
//var MONGODBURL = 'mongodb://localhost:27017/test';
var rschema = require('./models/rschema');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function Restaurant(building,lon,lat,street,zipcode,borough,cuisine,name,restaurant_id) {
	function Address(building,lon,lat,street,zipcode) {
		this.building = building;
		this.coord = [];
		this.coord.push(lon);
		this.coord.push(lat);
		this.street = street;
		this.zipcode = zipcode;
	}
	this.address = new Address(building,lon,lat,street,zipcode);
	this.borough = borough;
	this.cuisine = cuisine;
	this.grades = [];
	this.name = name;
	this.restaurant_id = restaurant_id;
}

function grade(date,grade,score){
	this.date = date;
	this.grade = grade;
	this.score = score;

}

var insertRestaurant = function(db, r, callback) {
	db.collection('abc123').insert(r, function(err,result) {
		    assert.equal(err,null);
		console.log("Insert done");
		callback();
	});
};


app.post('/',function (req,res) {
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
	var rObj = {};
		rObj.address = {};
		rObj.address.building = req.body.building;
		rObj.address.street = req.body.street;
		rObj.address.zipcode = req.body.zipcode;
		rObj.address.coord = [];
		rObj.address.coord.push(req.body.lon);
		rObj.address.coord.push(req.body.lat);
		rObj.borough = req.body.borough;
		rObj.cuisine = req.body.cuisine;
		rObj.name = req.body.name;
		rObj.restaurant_id = req.body.restaurant_id;

		var Restaurant = mongoose.model('abc123', rschema);
		var r = new Restaurant(rObj);
		//console.log(r);
		r.save(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		//console.log('Restaurant created!')
       		db.close();
			res.status(200).json({message: 'insert done', id: r._id});
    	});
    });
});

//********Search****************************************************************************************//
app.get('/', function(req,res) {
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find({},function(err,results){
       		if (err) {
				res.status(500).json(err);
				throw err
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {
				res.status(200).json({message: 'No matching document'});
			}
			
			db.close();
    	});
    });
});



app.get('/:attrib/:attrib_value', function(req,res) {
	var criteria ={};
	if(req.params.attrib==="street" || req.params.attrib==="zipcode" || req.params.attrib==="building"){
		criteria['address.'+ req.params.attrib] = req.params.attrib_value;
	}
	else if(req.params.attrib==="lon"){
		criteria['address.coord.0'] = req.params.attrib_value;
	}
	else if(req.params.attrib==="lat"){
		criteria['address.coord.1'] = req.params.attrib_value;
	}
	else if(req.params.attrib==="grade"){
		var inside = {};
		inside['grade'] = req.params.attrib_value;
		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;
		criteria['grades'] = elemMatch;
	}
	else if(req.params.attrib==="score"){
		var inside = {};
		inside['score'] = req.params.attrib_value;
		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;
		criteria['grades'] = elemMatch;
	}
	else{
		criteria[req.params.attrib] = req.params.attrib_value;
	}
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				throw err
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    		});
    	});
});

app.get('/:attrib1/:attrib1_value/:attrib2/:attrib2_value', function(req,res) {
	var criteria ={};
	//add first criteria
	if(req.params.attrib1==="street" || req.params.attrib1==="zipcode" || req.params.attrib1==="building"){
		criteria['address.'+ req.params.attrib1] = req.params.attrib1_value;
	}
	else if(req.params.attrib1==="lon"){
		criteria['address.coord.0'] = req.params.attrib1_value;
	}
	else if(req.params.attrib1==="lat"){
		criteria['address.coord.1'] = req.params.attrib1_value;
	}
	else if(req.params.attrib1==="grade"){
		var inside = {};
		inside['grade'] = req.params.attrib1_value;

		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;

		criteria['grades'] = elemMatch;
	}
	else if(req.params.attrib1==="score"){
		var inside = {};
		inside['score'] = req.params.attrib1_value;
		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;
		criteria['grades'] = elemMatch;
	}
	else{
		criteria[req.params.attrib1] = req.params.attrib1_value;
	}
	//add second criteria
	if(req.params.attrib2==="street" || req.params.attrib2==="zipcode" || req.params.attrib2==="building"){
		criteria['address.'+ req.params.attrib2] = req.params.attrib2_value;
	}
	else if(req.params.attrib2==="lon"){
		criteria['address.coord.0'] = req.params.attrib2_value;
	}
	else if(req.params.attrib2==="lat"){
		criteria['address.coord.1'] = req.params.attrib2_value;
	}
	else if(req.params.attrib2==="grade"){
		var inside = {};
		inside['grade'] = req.params.attrib2_value;

		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;

		criteria['grades'] = elemMatch;
	}
	else if(req.params.attrib2==="score"){
		var inside = {};
		inside['score'] = req.params.attrib2_value;
		var elemMatch = {};
		elemMatch['$elemMatch'] = inside;
		criteria['grades'] = elemMatch;
	}
	else{
		criteria[req.params.attrib2] = req.params.attrib2_value;
	}

	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				throw err
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    		});
    	});
});


app.get('/avg/:id', function(req,res) {
mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		var target = {restaurant_id: ""};
		target.restaurant_id = req.params.id;
		restaurant.findOne(target, function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				
				var total =0.0;
				
				for(var ngrade = 0; ngrade<results.grades.length; ngrade++){
				//for (var ngrade in results.grades) {				
				//	console.log(results.grades[ngrade].score);
				total = total + results.grades[ngrade].score;
			
				}	
				console.log(total);
	                 	total = ((total/results.grades.length).toFixed(2));
				console.log(results.restaurant_id + "\taverage score: " + total);
				res.status(200).json({message: results.restaurant_id + "\taverage score: " + total, id:results._id});
				res.end();
				db.close();
			}
				
		
		});
	});
});
//********End Search*******************************************************************************//

//********Delete*******************************************************************************//
app.delete('/:attrib/:attrib_value',function(req,res) {
	var criteria ={};
	if(req.params.attrib==="street" || req.params.attrib==="zipcode" || req.params.attrib==="building"){
		criteria['address.'+ req.params.attrib] = req.params.attrib_value;
	}
	else if(req.params.attrib==="lon"){
		criteria['address.coord.0'] = req.params.attrib_value;
	}
	else if(req.params.attrib==="lat"){
		criteria['address.coord.1'] = req.params.attrib_value;
	}
	else{
		criteria[req.params.attrib] = req.params.attrib_value;
	}
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find(criteria).remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		db.close();
			res.status(200).json({message: 'delete done', id: req.params.attrib_value});
    	});
    });
});

app.delete('/:attrib1/:attrib1_value/:attrib2/:attrib2_value',function(req,res) {
	var criteria ={};
	//add first criteria
	if(req.params.attrib1==="street" || req.params.attrib1==="zipcode" || req.params.attrib1==="building"){
		criteria['address.'+ req.params.attrib1] = req.params.attrib1_value;
	}
	else if(req.params.attrib1==="lon"){
		criteria['address.coord.0'] = req.params.attrib1_value;
	}
	else if(req.params.attrib1==="lat"){
		criteria['address.coord.1'] = req.params.attrib1_value;
	}
	else{
		criteria[req.params.attrib1] = req.params.attrib1_value;
	}
	//add second criteria
	if(req.params.attrib2==="street" || req.params.attrib2==="zipcode" || req.params.attrib2==="building"){
		criteria['address.'+ req.params.attrib2] = req.params.attrib2_value;
	}
	else if(req.params.attrib2==="lon"){
		criteria['address.coord.0'] = req.params.attrib2_value;
	}
	else if(req.params.attrib2==="lat"){
		criteria['address.coord.1'] = req.params.attrib2_value;
	}
	else{
		criteria[req.params.attrib2] = req.params.attrib2_value;
	}
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find(criteria).remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		db.close();
			res.status(200).json({message: 'delete done'});
    	});
    });
});

app.delete('/',function(req,res) {
	
	var restaurantSchema = require('./models/rschema');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('abc123', rschema);
		Restaurant.find().remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		db.close();
			res.status(200).json({message: 'delete done (remove all documents)'});
    	});
    });
});
//********End Delete*******************************************************************************//

//********Update****************************************************************************************//
app.put('/restaurant_id/:id/grade', function(req,res) {
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		var target = {restaurant_id: ""};
		target.restaurant_id = req.params.id;
		restaurant.findOne(target, function(err,results) {
			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				results.grades.push({date:req.body.date, grade:req.body.grade, score:req.body.score});
				results.save(function(err) {
					if (err) {
						console.log("Error: " + err.message);
						res.write(err.message);
						res.end();
					}
					else {
					res.status(200).json({message: 'update done', id:results});
						
						res.end();
						db.close();					}
				});
			}
		});
	});
});

app.put('/update/name/:name/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	criteria[req.params.attrib] = req.params.attrib_value;
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		restaurant.update({name:req.params.name},{$set:criteria},function(err){
			if (err) {
				res.status(500).json(err);
				throw err
			}
			else {
				res.write("Done!\n");
				res.end();
			}
			db.close();
		});	
	});
});

app.put('/update/name/:name/address/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	criteria['address.'+req.params.attrib] = req.params.attrib_value;
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		restaurant.update({name:req.params.name},{$set:criteria},function(err){
			if (err) {
				res.status(500).json(err);
				throw err
			}
			else {
				res.write("Done!\n");
				res.end();
			}
			db.close();
		});	
	});
});


app.put('/update/restaurant_id/:id/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	criteria[req.params.attrib] = req.params.attrib_value;
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		restaurant.update({restaurant_id:req.params.id},{$set:criteria},function(err){
			if (err) {
				res.status(500).json(err);
				throw err
			}
			else {
				res.write("Done!\n");
				res.end();
			}
			db.close();
		});	
	});
});

app.put('/update/restaurant_id/:id/address/:attrib/:attrib_value', function(req,res) {
	var criteria = {};
	criteria['address.'+req.params.attrib] = req.params.attrib_value;
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var restaurant = mongoose.model('abc123', rschema);
		restaurant.update({restaurant_id:req.params.id},{$set:criteria},function(err){
			if (err) {
				res.status(500).json(err);
				throw err
			}
			else {
				res.write("Done!\n");
				res.end();
			}
			db.close();
		});	
	});
});

//********EndUpdate*************************************************************************************//












app.listen(process.env.PORT || 8099);
