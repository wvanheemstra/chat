/*
 * MQL Read and Write Service.
 */

/********************************************************************************************
* MQL READ
*********************************************************************************************/
exports.read = function(req, res) {
	var sys = require("sys"),  
	    http = require("http"),  
	    url = require("url"),  
	    path = require("path"),  
	    fs = require("fs");
	var metadata = null;
	var args = null;
	/****************************************************************************
	* Getters and Setters
	*****************************************************************************/
	function getMetadata() {
		return this.metadata;
	}
	function setMetadata(metadata) {
		this.metadata = metadata;
	}
	function getArgs() {
		return this.args;
	}
	function setArgs(args) {
		this.args = args;
	}
	/*****************************************************************************
	*   Main
	******************************************************************************/
	// STEP ONE: Schema
	var metadata_file_name = __dirname + '/../schemas/coreSchema.json'; // TO DO: define in config
	init_metadata(metadata_file_name, function(err, json){
		var metadata = json; // now metadata is set to the schema
		console.log("metadata: "); // for testing only
		console.log(metadata); // for testing only
		setMetadata(metadata); // for global access
		var connection_file_name = __dirname + '/../connections/coreConnection.json'; // TO DO: define in config
		//STEP TWO: Database Connection
		init_connection(connection_file_name, function(err, json){
			var connection = json; // now connection is set to the database connection
			console.log("connection: "); // for testing only
			console.log(connection); // for testing only
			var connection_config = connection['connection_config'];
			console.log("connection_config: "); // for testing only
			console.log(connection_config); // for testing only	
			init_dialect(connection_config, function(err, connection_dsn){
				var db_type = connection_dsn['db_type'];
				console.log("db_type: "); // for testing only
				console.log(db_type); // for testing only		
				var sqldialect_file_name = __dirname + '/../dialects/'+db_type+'Dialect.json';
				init_sqldialect(sqldialect_file_name, function(err, json){
					var sqldialect = json;
					console.log("sqldialect: "); // for testing only
					console.log(sqldialect); // for testing only
					var db_connection = require(db_type);
					var db_name = connection_dsn['db_name'];
					var host = connection_dsn['host'];
					var port = connection_dsn['port'];
					var username = connection_config['username'];
					var password = connection_config['password'];
					if(is_object(db_connection_string)) // check if a connection string already exists
					{
						console.log("db_connection_string already exists."); // for testing only
						var existing_db_connection_string = db_connection_string;					
					}
					var db_connection_string = {};
					db_connection_string['host'] = host;
					db_connection_string['port'] = port;				
					db_connection_string['user'] = username; // NOTE: special name for user
					db_connection_string['password'] = password;
					console.log("db_connection_string: "); // for testing only
					console.log(db_connection_string); // for testing only
					if(is_object(db_connection_created)) // check if a connection already exists
					{
						console.log("db_connection_created already exists."); // for testing only
						var existing_db_connection_created = db_connection_created;
						if(existing_db_connection_string === db_connection_string)
						{
							// no need to recreate a connection, reuse existing connection instead
							console.log("re-using db_connection."); // for testing only
						}
						else
						{
							// need to recreate a connection, use new connection string
							var db_connection_created = db_connection.createConnection(db_connection_string)
							console.log("re-created db_connection."); // for testing only
						}
					}
					else // no connection already exists
					{
						var db_connection_created = db_connection.createConnection(db_connection_string)
						console.log("created db_connection."); // for testing only
					}
					try {
						console.log('db_connection_created: '); // TEMP
						console.log(db_connection_created); // TEMP
						var db = db_connection_created.connect();
						console.log("connection: successful"); // for testing only
						//STEP THREE: Args
						console.log("req:"); // for testing only
						console.log(req); // for testing only
						init_args(req, function(err, args){	
							console.log("args: "); // for testing only
							console.log(args); // for testing only
							setArgs(args); // for global access
							// STEP FOUR: Handle Request
							var metadata = getMetadata();
							handle_request(metadata, args, function(err, result, args){
								console.log("args: "); // for testing only
								console.log(args); // for testing only
								console.log("result: "); // for testing only
								console.log(result); // for testing only
								// Static for the time being, overwrites collected sql query result
								var result = [
							    	{
							     		"type": "/core/person",
							     		"kp_PersonID": 1,
							     		"PersonFirstName": "Zenaida",
							     		"PersonLastName": "Rodarte"
							    	},
								    {
								     	"type": "/core/person",
								     	"kp_PersonID": 2,
								     	"PersonFirstName": "Giuseppe",
								     	"PersonLastName": "Cerda"
								    }
								];
								console.log("result: "); // for testing only
								console.log(result); // for testing only	

								var output = {};	
								
								var service = "mqlread";
								output["service"] = service;
								
								var url = "/services/mql/read";
								output["url"] = url;

								var code = "/api/status/ok";
							    output["code"] = code; // Change depending on success or failure

							    output["result"] = result;

								var status = "200 OK"; // Change depending on success or failure
								output["status"] = status;
								
								var transaction_id = "not implemented";
								output["transaction_id"] = transaction_id;

								res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
								res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
								res.header('Access-Control-Allow-Credentials', true);
								res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS

								if(is_object(args)) {
									var args = args; // have to recreate args for next test
									if(typeof(args.sql) != 'undefined'){
										output["sql"] = args['sql'];	
									}
									if (typeof(args.callback) != 'undefined') {
										res.header('Content-Type', 'text/javascript');
										console.log("output:"); // for testing only
										console.log(output); // for testing only
										res.send(args.callback+'('+output+')');
								    } 
									else {
										res.header('Content-Type', 'application/json');
										console.log("output:"); // for testing only
										console.log(output); // for testing only
										res.send(output);
									}
								}
							    else {
									res.header('Content-Type', 'application/json');
									console.log("output:"); // for testing only
									console.log(output); // for testing only
									res.send(output);
							    }
							});//eof handle_request
						});//eof init_args
					}//eof try
					catch (e) {
						console.log("connection error: "); // for testing only
						console.log(e); // for testing only
					}//eof catch
				});//eof init_sqldialect
			});//eof init_dialect
		});//eof init_connection
	});//eof init_metadata
};//eof export.read
/********************************************************************************************
* MQL WRITE
*********************************************************************************************/	
exports.write = function(req, res) {
	res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
	res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS
	res.send({ service : "mql.write", url 
	: "/services/mql/write", info: "mql.write not implemented" });
};//eof export.write
/*****************************************************************************
*   Handle Request
******************************************************************************/
function handle_request(metadata, args, cb){
	console.log('>>> inside handle_request'); // for testing only
	if(typeof(args.mql) != 'undefined') {
		var mql = args['mql'];
		console.log('mql:'); // for testing only	
		console.log(mql); // for testing only		
		if(typeof(mql.query) != 'undefined') {
	        var query = mql['query'][0]; // the [0] removes potential [] around the json
			console.log('query:'); // for testing only	
			console.log(query); // for testing only
			var query_or_queries = query;
	    }
		if(typeof(mql.queries) != 'undefined') {
	        var queries = mql['queries'][0]; // the [0] removes potential [] around the json
			console.log('queries:'); // for testing only	
			console.log(queries); // for testing only
			var query_or_queries = queries;
	    }
		console.log('query_or_queries:'); // for testing only	
		console.log(query_or_queries); // for testing only
		try {
			var query_decode = query_or_queries; // already in JSON format so no need to parse again
			if(!is_object(query_decode)) {
				console.log('error - query_decode is not an object:'); // for testing only
				console.log(query_decode); // for testing only
				cb(null);
			} 
			else
			{
				if(typeof(mql.queries) != 'undefined')
				{
					handle_queries(metadata, query_decode, args, function(err, result, args) {
						if(err)
						{
							cb(err);
						} 
						else
						{
							cb(null, result, args);
						}
					});
				}
				if(typeof(mql.query) != 'undefined')
				{
					handle_query(metadata, query_decode, args, function(err, result, args) {
						if(err)
						{
							cb(err);
						} 
						else
						{
							cb(null, result, args);
						}
					});
				}
				else {
					console.log('neither queries nor query property on mql'); // for testing only
					cb(null);
				}
			}
		}
		catch(e) {
			console.log('failed to parse query:'); // for testing only	
			console.log(e); // for testing only	
			cb(null);		
		}
	}
	else
	{
		console.log('No property mql in args.');// for testing only 
		cb(null);
	}
}// eof handle_request
/*****************************************************************************
*   Schema
******************************************************************************/
function init_metadata(path, cb){
//	see http://www.slideshare.net/the_undefined/nodejs-best-practices-10428790
//  see http://recurial.com/programming/understanding-callback-functions-in-javascript/	
	var fs = require("fs");
	fs.readFile(path, 'utf8', function(err, data) {
		if(err) throw cb(err);
		json = JSON.parse(data);
		cb(null, json);
	});
}// eof init_metadata
/*****************************************************************************
*   Database
******************************************************************************/
function init_dialect(connection_config, cb){
    var connection_dsn = connection_config['dsn'];
	console.log("connection_dsn: "); // for testing only
	console.log(connection_dsn); // for testing only
	cb(null, connection_dsn);
}// eof init_dialect
function init_sqldialect(path, cb){
//	see http://www.slideshare.net/the_undefined/nodejs-best-practices-10428790
//  see http://recurial.com/programming/understanding-callback-functions-in-javascript/	
	var fs = require("fs");
	fs.readFile(path, 'utf8', function(err, data) {
		if(err) throw cb(err);
		json = JSON.parse(data);
		cb(null, json);
	});
}// eof init_sqldialect
function init_connection(path, cb){
//	see http://www.slideshare.net/the_undefined/nodejs-best-practices-10428790
//  see http://recurial.com/programming/understanding-callback-functions-in-javascript/	
	var fs = require("fs");
	fs.readFile(path, 'utf8', function(err, data) {
		if(err) throw cb(err);
		json = JSON.parse(data);
		cb(null, json);
	});
}// eof init_connection
/*****************************************************************************
*   Miscellaneous
******************************************************************************/
function init_args(req, cb){
	console.log('req.method:'); // for testing only	
	console.log(req.method); // for testing only
	switch (req.method) {
		case 'GET':
	            var args = req.get();
				console.log('req.get():'); // for testing only	
				console.log(req.get()); // for testing only
				cb(null, args);
	            break;
	    case 'POST':
	            var args = req.body;
				console.log('req.body:'); // for testing only	
				console.log(req.body); // for testing only
				cb(null, args);
	            break;
		case 'OPTIONS':
	            var args = req.body;
				console.log('req.body:'); // for testing only	
				console.log(req.body); // for testing only
				cb(null, args);
	            break;	
	    default:
	            console.log('Must use either GET, POST, or OPTIONS');
				cb(null);
	}
}//eof init_args
function is_object (mixed_var) {
  // see http://phpjs.org/functions/is_object/	
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Legaev Andrey
  // +   improved by: Michael White (http://getsprink.com)
  // *     example 1: is_object('23');
  // *     returns 1: false
  // *     example 2: is_object({foo: 'bar'});
  // *     returns 2: true
  // *     example 3: is_object(null);
  // *     returns 3: false
  if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
    return false;
  }
  return mixed_var !== null && typeof mixed_var == 'object';
}//eof is_object
function is_array (mixed_var) {
  return typeof(mixed_var)=='object' && (mixed_var instanceof Array);
}//eof is_array
function get_object_vars (metadata, mql_object, types, cb) {
	console.log('>>> inside get_object_vars'); // for testing only
  // see http://phpjs.org/functions/get_object_vars/	
  // http://kevin.vanzonneveld.net
  // +   original by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: function Myclass () {this.privMethod = function (){}}
  // *     example 1: Myclass.classMethod = function () {}
  // *     example 1: Myclass.prototype.myfunc1 = function () {return(true);};
  // *     example 1: Myclass.prototype.myfunc2 = function () {return(true);}
  // *     example 1: get_object_vars('MyClass')
  // *     returns 1: {}
  var object_vars = {},
    prop = '';
  for (prop in mql_object) {
    if (typeof mql_object[prop] !== 'function' && prop !== 'prototype') {
      object_vars[prop] = mql_object[prop];
    }
  }
  for (prop in mql_object.prototype) {
    if (typeof mql_object.prototype[prop] !== 'function') {
      object_vars[prop] = mql_object.prototype[prop];
    }
  }
  cb(null, metadata, object_vars, types);
} // eof get_object_vars
function preg_match_all(property_pattern, property_name, property_value, metadata, star_property, cb) {
   // see http://coding.pressbin.com/16/Javascript-equivalent-of-PHPs-pregmatchall
	console.log('>>> inside preg_match_all'); // for testing only
	console.log('property_pattern:'); // for testing only
	console.log(property_pattern); // for testing only		
	console.log('property_name:'); // for testing only
	console.log(property_name); // for testing only
	console.log('property_value:'); // for testing only
	console.log(property_value); // for testing only
	console.log('metadata:'); // for testing only
	console.log(metadata); // for testing only	
	console.log('star_property:'); // for testing only
	console.log(star_property); // for testing only		
	var matches = new Array();
	
// LOOK THIS OVER:		
	var regexp = new RegExp(property_pattern);
	if(regexp.test(property_name)) {
		console.log("found a match for: "+property_name);
		matches.push(property_name);
	}
	else {
		console.log("found no match for: "+property_name);
	}

	// var globalRegex = new RegExp(property_pattern, 'g');
	// var globalMatch = property_name.match(globalRegex);
	// 
	// for (var i in globalMatch) {
	// 	nonGlobalRegex = new RegExp(property_pattern);
	// 	nonGlobalMatch = globalMatch[i].match(nonGlobalRegex);
	// 	matches.push(nonGlobalMatch[1]);
	// }
// TO HERE	
	
	console.log('matches:'); // for testing only
	console.log(matches); // for testing only
	cb(null, matches, property_value, metadata, star_property);
}//eof preg_match_all
function array_keys(input, search_value, argStrict) {
	console.log('>>> inside array_keys'); // for testing only 
  // see http://phpjs.org/functions/array_keys/	
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: jd
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   input by: P
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: array_keys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
  // *     returns 1: {0: 'firstname', 1: 'surname'}
  var search = typeof search_value !== 'undefined',
    tmp_arr = [],
    strict = !!argStrict,
    include = true,
    key = '';
  if (input && typeof input === 'object' && input.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
    return input.keys(search_value, argStrict);
  }
  for (key in input) {
    if (input.hasOwnProperty(key)) {
      include = true;
      if (search) {
        if (strict && input[key] !== search_value) {
          include = false;
        }
        else if (input[key] != search_value) {
          include = false;
        }
      }
      if (include) {
        tmp_arr[tmp_arr.length] = key;
      }
    }
  }
  return tmp_arr;
}//eof array_keys
/**
* Unset variables, objects, array elements and object 
* properties in Javascript much like you can in PHP
* @author Ahmad Retha
* @license Public Domain
*/
function unset() {
	console.log('>>> inside unset'); // for testing only 
    for(var _i = 0; _i < unset.arguments.length; _i++){
        //where item to unset is an array element (var[index])
        if(_m = unset.arguments[_i].match(/(\w+)\[(\d+)\]/)){
            eval(_m[1] + ".splice(" + _m[2] + ", 1);");
        //where item to unset is an object item
        }else if(unset.arguments[_i].match('.')){
            eval("delete " + unset.arguments[_i] + ";");
        //where item to unset is a normal variable
        }else{
            eval(unset.arguments[_i] + " = undefined;");
        }
    }
}//eof unset
/*****************************************************************************
*	Benchmarking
******************************************************************************/
function callstack_push(name) {
	console.log('>>> inside callstack_push'); // for testing only 
	if(!is_object(callstack))
	{
		var callstack = []; // first time creation
	}
	var unixtime_ms = new Date().getTime();
	var sec = parseInt(unixtime_ms / 1000);
	var microtime = (unixtime_ms - (sec * 1000))/1000 + ' ' + sec;
    callstack.push({"name":name, "microtime":microtime});
	console.log('callstack:'); // for testing only
	console.log(callstack); // for testing only	
}
/*****************************************************************************
*	General Functions
******************************************************************************/



/*****************************************************************************
*	MQL Processing Functions
******************************************************************************/
function analyze_type(type, metadata, star_property, cb) {
	console.log('>>> inside analyze_type'); // for testing only
	console.log('type:'); // for testing only
	console.log(type); // for testing only
	var type_pattern = type.toString(); // TEMP SOLUTION, ORIGINAL: '/^\/(\w+)\/(\w+)$/';
	// Explanation:
	// The (\w+) grouping looks for word characters, as denoted by the \w. 
	// The + indicates that one or more word characters must appear (not necessarily the same one)
	// The $ is a literal character. The second (\w+) grouping must be followed by a literal $ character.
	preg_match_all(type_pattern, type, metadata, star_property, function(err, matches, property_value, metadata, star_property){
		console.log('matches:'); // for testing only
		console.log(matches); // for testing only
		console.log('property_value:'); // for testing only
		console.log(property_value); // for testing only
		console.log('metadata:'); // for testing only
		console.log(metadata); // for testing only		
		console.log('star_property:'); // for testing only
		console.log(star_property); // for testing only		
	    if (matches) {
			var type = new Array({'domain': matches[1],'type': matches[2]});
			console.log('type:'); // for testing only
			console.log(type); // for testing only
	        cb(null, type, metadata, star_property);
	    } 
		else {
			var type = false; // a boolean???, should be null surely
			console.log('type:'); // for testing only
			console.log(type); // for testing only
	    	cb(null, type, metadata, star_property);
		}
	});//eof preg_match_all
}




function is_filter_property(property_value, matches, metadata, star_property, cb){   
	console.log('>>> inside is_filter_property'); // for testing only 
	console.log('property_value:'); // for testing only
	console.log(property_value); // for testing only
	console.log('matches:'); // for testing only
	console.log(matches); // for testing only		
    if (property_value===null) {
		console.log('property_value is null'); // for testing only
        cb(null, matches, property_value, false, metadata, star_property);
    }
    else if (	is_object(property_value) && 
			count(
				get_object_vars(metadata, property_value, null, function(err, metadata, object_vars, types){
					console.log('object_vars:'); // for testing only
					console.log(object_vars); // for testing only
					console.log('count(object_vars):'); // for testing only
					console.log(count(object_vars)); // for testing only										
					return count(object_vars);
				})
			)===0			
		)
	{
        cb(null, matches, property_value, false, metadata, star_property);
    }
    else if (	is_array(property_value) && 
			count(property_value)===0
		) 
	{
		console.log('count(property_value):'); // for testing only
		console.log(count(property_value)); // for testing only
        cb(null, matches, property_value, false, metadata, star_property);
    }
    else {
		console.log('property_value is filter property'); // for testing only
        cb(null, matches, property_value, true, metadata, star_property);
    }
}//eof is_filter_property
function analyze_property(property_name, property_value, metadata, star_property, cb){
    //                      12   2 1 345          5  4 6      647 
	console.log('>>> inside analyze_property'); // for testing only                                7
    var property_pattern = property_name; //TEMPORARY FIX, 
	//ORIGINAL '/^(((\w+):)?(((\/\w+\/\w+)\/)?(\w+|\*))(=|<=?|>=?|~=|!=|\|=|!\|=|\?=|!\?=)?)$/';
	console.log('property_pattern:'); // for testing only
	console.log(property_pattern); // for testing only
	preg_match_all(property_pattern, property_name, property_value, metadata, star_property, function(err, matches, property_value, metadata, star_property){
		console.log('matches:'); // for testing only
		console.log(matches); // for testing only
		console.log('property_value:'); // for testing only
		console.log(property_value); // for testing only
		console.log('metadata:'); // for testing only
		console.log(metadata); // for testing only	
		console.log('star_property:'); // for testing only
		console.log(star_property); // for testing only			
	    if (matches) {
			console.log('property does match'); // for testing only
			is_filter_property(property_value, matches, metadata, star_property, function(err, matches, property_value, is_filter_property, metadata, star_property){
				console.log('matches:'); // for testing only
				console.log(matches); // for testing only
				console.log('property_value:'); // for testing only
				console.log(property_value); // for testing only				
				console.log('is_filter_property:'); // for testing only
				console.log(is_filter_property); // for testing only				
			    var analyzed_property = new Array({
					'prefix': matches[3],
					'qualifier': matches[6],
					'name': matches[7],
					'operator': matches[8] = typeof matches[8] !== 'undefined' ? matches[8] : null,
					'qualified': matches[5] = typeof matches[5] !== 'undefined' ? true : false,
					'value': property_value,
					'is_filter': is_filter_property,
					'is_directive': false,
					'schema': null
		        });
				console.log('analyzed_property:'); // for testing only
				console.log(analyzed_property); // for testing only	
				return (null, analyzed_property, property_value, metadata, star_property);
			});
			console.log('>>> leaving analyze_property');
			return (null, metadata, star_property); // WE NEED TO ADD ALL !!! THE PROPERTIES RETRIEVED FROM is_filter_property HERE
	    } 
		else {
			console.log('property does not match'); // for testing only
			console.log('>>> leaving analyze_property with error');
			var err = new Error('property does not match');
	    	return (err);
		}
	});//eof preg_match_all
	console.log('>>> leaving analyze_property');
	cb(null, property_name, metadata, star_property);
}//eof analyze_property  
function get_type_from_schema(metadata, domain, type, cb) {
	console.log('>>> inside get_type_from_schema'); // for testing only
	console.log('metadata:'); // for testing only
	console.log(metadata); // for testing only	
	console.log('domain:'); // for testing only
	console.log(domain); // for testing only
	console.log('type:'); // for testing only
	console.log(type); // for testing only		
    var domains = metadata['domains'];
	console.log('domains:'); // for testing only
	console.log(domains); // for testing only
	// MQL Domains map to SQL schemas
	// MQL Types map to SQL tables
	// MQL properties can map to two things:
	//   - columns, in case the property type implies a value
	//   - foreign keys, which implement a relationship to a table
	if(typeof(domains[domain.toString()]) != 'undefined') { 
		// domain exists in schema, continue 
		console.log('domain \''+domain+'\' exists in schema'); // for testing only
		var types = domains[domain.toString()]['types'];
		console.log('types:'); // for testing only
		console.log(types); // for testing only
		if (typeof(types[type.toString()]) != 'undefined') {
			// type exists in schema, continue 
			console.log('type \''+type+'\' exists in schema'); // for testing only
			var types_type = types[type.toString()];
			console.log('types_type:'); // for testing only
			console.log(types_type); // for testing only			
			cb(null, types_type, domain, type);
	    }
	    else { // type does not exist in schema
			console.log('type \''+type+'\' does not exist in schema'); // for testing only
			var err = new Error('type \''+type+'\' does not exist in schema');
			cb(null);
	    }
	}
	else { // domain does not exist in schema
		console.log('domain \''+domain+'\' does not exist in schema'); // for testing only
		var err = new Error('domain \''+domain+'\' does not exist in schema');
		cb(null);
	}   
}

//helper for process_mql_object
function get_parent_type(metadata, parent, types, mql_object, cb) {
	console.log('>>> inside get_parent_type'); // for testing only
	if(typeof(parent) != 'undefined') {
		console.log('parent:'); // for testing only
		console.log(parent); // for testing only		
		if(typeof(parent.schema) != 'undefined'){
			console.log('parent.schema:'); // for testing only
			console.log(parent.schema); // for testing only	
			var parent_schema_type_domain = parent['schema']['domain'];
			console.log('parent_schema_type_domain:'); // for testing only
			console.log(parent_schema_type_domain); // for testing only	
			var parent_schema_type_type = parent['schema']['type'];
			console.log('parent_schema_type_type:'); // for testing only
			console.log(parent_schema_type_type); // for testing only
			get_type_from_schema(metadata, parent_schema_type_domain, parent_schema_type_type, function(err, parent_schema_type, parent_schema_type_domain, parent_schema_type_type) {
				console.log('parent_schema_type:'); // for testing only
				console.log(parent_schema_type); // for testing only
		        if (!parent_schema_type) {
		            console.log('The parent type "/'
		            +parent_schema_type_domain+'/'+parent_schema_type_type
		            +'" was not found in the schema.'
		            +' This indicates a logical error in the schema.'
		            );
					var err = new Error('The parent type "/'
		            +parent_schema_type_domain+'/'+parent_schema_type_type
		            +'" was not found in the schema.'
		            +' This indicates a logical error in the schema.');
					cb(err); //TEMP
		        }
		        types[parent_schema_type_type.toString()] = parent_schema_type;
				console.log('types:'); // for testing only
				console.log(types); // for testing only		
				cb(null, metadata, types, mql_object); //TEMP
			});//eof get_type_from_schema
		}
		else { 
			console.log('parent.schema is not an object.'); // for testing only
			var err = new Error('parent.schema is not an object.');
			cb(err); //TEMP
		}
	} 
	else {
		console.log('parent is not an object.'); // for testing only
		var err = new Error('parent is not an object.');
		cb(err); //TEMP
	}
}//eof get_parent_type
//helper for process_mql_object
function check_types(types, cb) {
	console.log('>>> inside check_types'); // for testing only
	console.log('types:'); // for testing only
	console.log(types); // for testing only	
	if(typeof(types) != 'undefined') {
	    switch (Object.keys(types).length) {
	        case 0:
	            console.log('Could not find a type. Currently we rely on a known type');
				return null; //TEMP
	        case 1:
	            //assigning the contents of the array to the type variable.
				var types_keys = Object.keys(types);
				console.log('types_keys:'); // for testing only
				console.log(types_keys); // for testing only				
				for(var i=0; i<Object.keys(types_keys).length; i++) {
					var type_key = Object.keys(types_keys)[i].key;
					console.log('type_key:'); // for testing only
					console.log(type_key); // for testing only					
					var type_value = Object.keys(types_keys)[i].value;
					console.log('type_value:'); // for testing only
					console.log(type_value); // for testing only					
					var checked_types = new Array({type_key:type_value}); // TO DO: Check if this works as expected
					console.log('checked_types:'); // for testing only
					console.log(checked_types); // for testing only
				}
	            break;
	        default:
	            console.log('Found more than one type. Currently we can handle only one type.');
				var err = new Error('Found more than one type. Currently we can handle only one type.');
				cb(err); //TEMP
	    }
		cb(null, checked_types); //TEMP
	} 
	else {
		console.log('types is not an object:');// for testing only
		console.log(types);// for testing only	
		var err = new Error('types is not an object');	
		cb(err); //TEMP
	}
}//eof check_types







//helper for process_mql_object
function expand_star(source_properties, target_properties) {
	console.log('>>> inside expand_star'); // for testing only
	var unset_target_properties = unset(target_properties['*']);	
	for(var i=0; i<source_properties.length; i++) {
		var property = source_properties[i];
        if (typeof(target_properties.property_name) != 'undefined') {
            continue;
        }
        if (typeof(property.column_name) != 'undefined') {
            target_properties[property_name] = array({
                'is_directive': false,
                'qualifier':'',
                'name': property_name,
                'value': null,
                'is_filter': false,
                'operator': null
            });
        }
    }
	return target_properties; // TEMP
}//eof expand_star
//helper for process_mql_object
function pre_process_properties(metadata, object_vars, properties, types, star_property, cb) {
	console.log('>>> inside pre_process_properties'); // for testing only
	console.log('object_vars:'); // for testing only
	console.log(object_vars); // for testing only
	console.log('object_vars.length:'); // for testing only
	console.log(Object.keys(object_vars).length); // for testing only
	for(var i=0; i<Object.keys(object_vars).length; i++) {
        var property_key = Object.keys(object_vars)[i];
		console.log('property_key:'); // for testing only
		console.log(property_key); // for testing only
		var property_value = object_vars[property_key.toString()];
		console.log('property_value:'); // for testing only
		console.log(property_value); // for testing only 	
		analyze_property(property_key, property_value, metadata, star_property, function(err, property, metadata, star_property){
			console.log('property:'); // for testing only
			console.log(property); // for testing only	
			console.log('metadata:'); // for testing only
			console.log(metadata); // for testing only
			console.log('star_property:'); // for testing only
			console.log(star_property); // for testing only				
		    if (typeof(property) != 'undefined'){
	            console.log('property is valid.');
				var operator = property[0]['operator'];
				console.log('operator:'); // for testing only
				console.log(operator); // for testing only			
	
				
			// SO FAR SO GOOD !!!				
				
					
		        if (operator) {  // We have not come into here yet with our test set       
		            var operator_in = (operator==='|=')||(operator==='!|=');
					console.log('operator_in:'); // for testing only
					console.log(operator_in); // for testing only
					
					var property_value = property[0]['value'];
					console.log('property_value:'); // for testing only
					console.log(property_value); // for testing only
										
		            if (property_value === null
		            ||  is_object(property_value)
		            || (operator_in && is_array(property_value) && count(property_value)===0)
		            ){
		                console.log("Operator "+$operator+' '
		                +((operator==='|=' || operator==='!|=')
		                ? 'takes a non-empty list of values' 
		                : 'takes a single value (not an object or an array)')
		                );
						var err = new Error("Operator "+$operator+' '
		                +((operator==='|=' || operator==='!|=')
		                ? 'takes a non-empty list of values' 
		                : 'takes a single value (not an object or an array)'));
						cb(err); // TEMP
		            }
		        }
		
		        var property_qualifier = property[0]['qualifier'];
				console.log('property_qualifier:'); // for testing only
				console.log(property_qualifier); // for testing only
						
		        var property_name = property[0]['name'];
				console.log('property_name:'); // for testing only
				console.log(property_name); // for testing only	
					
				switch (property_name) {
				    case 'type':
				    case 'creator':
				    case 'guid':
				    case 'id':         
				    case 'key':         
				    case 'name':
				    case 'permission':
				    case 'timestamp':
				        if (property_qualifier==='') {
				            property[0]['qualifier'] = '/type/object';
				        }
				        break;
				    case 'limit':
				    case 'optional':
				    case 'return':
				    case 'sort':
				    case '*':
				        if (property_qualifier==='' ) {
				            property[0]['is_directive'] = true;
				            switch (property_name) {
				                case 'optional':
				                    parent['optional'] = (property_value===true || property_value==='optional');
				                    break;
				                case '*':
				                    star_property = true;
				                    break;
				            }
				        }
				    default: // e.g. when property_name = undefined
				        if (property_qualifier === '/type/object') {
				            console.log('"'+property_name+'" is not a universal property, and may not have the qualifier "'+property_qualifier+'".');
							var err = new Error('"'+property_name+'" is not a universal property, and may not have the qualifier "'+property_qualifier+'".');
							cb(err); //TEMP
				        }
				}//eof switch
				if (property[0]['qualifier'] === '/type/object'
		        &&  property_name === 'type'
		        &&  is_object(property_value)
		        && !is_object(types.property_value)
		        ) {     
			
					// WE ARE HERE
			
		            analyze_type(property_value, metadata, star_property, function(err, type, metadata, star_property) {
						console.log('type:'); // for testing only
						console.log(type); // for testing only
				        if (!type) {
			                console.log('"'+property_value+'" is not a valid type identifier.');
							var err = new Error('"'+property_value+'" is not a valid type identifier.');
							cb(err); //TEMP
			            }
			            var domain = type['domain'];
			            var domain_type = type['type'];
			
						// HOW DO WE GET metadata ??
			
						get_type_from_schema(metadata, domain, domain_type, star_property, function(err, type, star_property){
							console.log('type:'); // for testing only
							console.log(type); // for testing only							
							if (!type) {
				                console.log('Type "/'+domain+'/'+domain_type+'" not found in schema.');
								var err = new Error('Type "/'+domain+'/'+domain_type+'" not found in schema.');
								cb(err); // TEMP
				            }
				            types['property_value'] = type;
							console.log('types:'); // for testing only
							console.log(types); // for testing only
							console.log('star_property:'); // for testing only
							console.log(star_property); // for testing only
							cb(null, types, star_property);
							
							
						});//eof get_type_from_schema

				
					});//eof analyze_type
		
					
		        }//eof if            
		        properties['property_key'] = property;
				console.log('properties:'); // for testing only
				console.log(properties); // for testing only
				console.log('star_property:'); // for testing only
				console.log(star_property); // for testing only
				cb(null, properties, star_property); //TEMP
	        }//eof if
			else {
				console.log('property is not valid.');
				var err = new Error('property is not valid.');
				cb(err);
			}//eof else
		});//eof analyze_property
    }//eof for
	if (err) { 
		throw(err);
	}
	else {
		cb(null, types, star_property);	
	}
}//eof pre_process_properties
function process_mql_object(metadata, mql_object, parent, cb) {
	console.log('>>> inside process_mql_object'); // for testing only
	mql_object = typeof mql_object !== 'undefined' ? mql_object : null;
	console.log('mql_object:'); // for testing only
	console.log(mql_object); // for testing only
	parent = typeof parent !== 'undefined' ? parent : [];
	// MQL properties can map to two things:
	//   - columns, in case the property type implies a value
	//   - foreign keys, which implement a relationship to a table
	var properties = [];
    parent['properties'] = properties;
	console.log('parent:'); // for testing only
	console.log(parent); // for testing only
	var types = [];
	get_parent_type(metadata, parent, types, mql_object, function(err, metadata, types, mql_object) {
		console.log('metadata:'); // for testing only
		console.log(metadata); // for testing only
		console.log('types:'); // for testing only
		console.log(types); // for testing only
		console.log('mql_object:'); // for testing only
		console.log(mql_object); // for testing only
		get_object_vars(metadata, mql_object, types, function(err, metadata, object_vars, types) {
			console.log('metadata:'); // for testing only
			console.log(metadata); // for testing only
			console.log('object_vars:'); // for testing only
			console.log(object_vars); // for testing only
			console.log('types:'); // for testing only
			console.log(types); // for testing only
			var star_property = false;
			pre_process_properties(metadata, object_vars, properties, types, star_property, function(err, types, star_property) {
				console.log('metadata:'); // for testing only
				console.log(metadata); // for testing only	
				console.log('object_vars:'); // for testing only
				console.log(object_vars); // for testing only
				console.log('properties:'); // for testing only
				console.log(properties); // for testing only											
				console.log('types:'); // for testing only
				console.log(types); // for testing only	
				console.log('star_property:'); // for testing only
				console.log(star_property); // for testing only
				
				
				// WE ARE HERE ... !!!!!
				// WE ARE HERE ... !!!!!
				// WE ARE HERE ... !!!!!	
							
				
				check_types(types, function(err, checked_types) {
					console.log('checked_types:'); // for testing only
					console.log(checked_types); // for testing only
					var type_name = [];
				    for(var i=0; i<checked_types.length; i++) { //extract the type name
						type_name[i] = checked_types[i];
					}
				    parent['types'] = array_keys(checked_types);
				    if (star_property===true) {
	//			        expand_star(type['properties'], pre_processed_properties ); // TO DO: Make this work
				    }
					process_properties(pre_processed_properties , type_name, type, function(err, processed_properties) {
						console.log('processed_properties:'); // for testing only
						console.log(processed_properties); // for testing only
						return processed_properties; // TEMP
					});//eof process_properties
				});//eof check_types
			});//eof pre_process_properties
		});//eof get_object_vars
	});//eof get_parent_type
}//eof process_mql_object

function process_mql_array(metadata, mql_array, parent, cb) {
	// TO DO
	cb(null); //TEMP
}//eof process_mql_array

function process_mql(metadata, mql, parent, cb) {
    if (mql===null) {
		console.log('mql is null:'); // for testing only
		console.log(mql); // for testing only
		var err = new Error('mql is null');
		cb(err);
    }
    else if (is_object(mql)) {
		console.log('mql is an object:'); // for testing only
		console.log(mql); // for testing only
		parent = typeof parent !== 'undefined' ? parent : null;
		console.log('parent:'); // for testing only
		console.log(parent); // for testing only
		process_mql_object(metadata, mql, parent, function(err, processed_mql_object) {
			
			// handle callback here
			return processed_mql_object;
		});
    }
    else if (is_array(mql)) { 
		console.log('mql is an array:'); // for testing only
		console.log(mql); // for testing only
		parent = typeof parent !== 'undefined' ? parent : null;
		console.log('parent:'); // for testing only
		console.log(parent); // for testing only		
		process_mql_array(metadata, mql, parent, function(err, processed_mql_array) { 
			
			// handle callback here	
			return processed_mql_array;	
		});
    }
    else {
        console.log('mql query must be an object or an array, not "'+gettype(mql)+'":'); // for testing only
		console.log(mql); // for testing only
		var err = new Error('mql query must be an object or an array, not "'+gettype(mql)+'"');
		cb(err);
    }
}//eof process_mql
/*****************************************************************************
*   SQL Generation Functions
******************************************************************************/
function reset_ids(t_alias_id, c_alias_id, p_id) {
    t_alias_id = 0;
    c_alias_id = 0;
    p_id = 0;
	return([t_alias_id,c_alias_id,p_id]);
}


function generate_sql(metadata, mql_node, queries, query_index, child_t_alias, merge_into) { // child_t_alias and merge_into are optional
	child_t_alias = typeof child_t_alias !== 'undefined' ? child_t_alias : null;
	merge_into = typeof merge_into !== 'undefined' ? merge_into : null;	
	// TO DO










	return null; //TEMP
/*
    if (isset($mql_node['entries'])) {
        generate_sql($mql_node['entries'], $queries, $query_index, $child_t_alias, $merge_into);
        return;
    }
    
    if (!isset($mql_node['query_index'])){
        $mql_node['query_index'] = $query_index;
    }
    
    $query = &$queries[$query_index];
    if (!$query){
        $query = array(
            'select'                =>  array()
        ,   'from'                  =>  array()
        ,   'where'                 =>  ''
        ,   'order_by'              =>  ''
        ,   'limit'                 =>  ''
        ,   'params'                =>  array()
        ,   'mql_node'              =>  &$mql_node
        ,   'indexes'               =>  array()
        ,   'merge_into'            =>  $merge_into
        ,   'results'               =>  array()
        );
        $queries[$query_index] = &$query;        
    }
    $select = &$query['select'];
    $from   = &$query['from'];
    $where  = &$query['where'];
    $params = &$query['params'];
    $indexes = &$query['indexes'];
    
    $type = analyze_type($mql_node['types'][0]);
    $domain_name = $type['domain'];
    $domains = $metadata['domains'];
    $schema_domain = $domains[$domain_name];
    $type_name = $type['type'];
    $schema_type = $schema_domain['types'][$type_name];
    
    //table_name is either explicitly specified, or we take the type name
    if (isset($schema_type['table_name'])){
        $table_name = $schema_type['table_name'];
    } 
    else {
        $table_name = $type_name;
    }
        
    //schema_name is either explicitly specified, or we take the domain name
    if (isset($schema_type['schema_name'])) {   //schema_name is defined at the type level
        $schema_name = $schema_type['schema_name'];
    }
    else                                        //schema_name is defined at the domain level     
    if (isset($schema_domain['schema_name'])){
        $schema_name = $schema_domain['schema_name'];
    }
    else {                                      //schema_name not defined, settle for the domain name
        $schema_name = $domain_name;
    }
    
    $t_alias = get_t_alias();

    get_from_clause($mql_node, $t_alias, $child_t_alias, $schema_name, $table_name, $query);
    if (array_key_exists('properties', $mql_node)) {
        $properties = &$mql_node['properties'];
        foreach ($properties as $property_name => &$property) {
            
            if ($property['is_directive']) {
                switch ($property_name) {
                    case 'limit':
                        $limit = intval($property['value']);
                        if ($limit < 0) {
                            exit('Limit must not be less than zero.');
                        }
                        $query['limit'] = $limit;
                        break;
                }
            }
            else
                        if (isset($mql_node['outer_join'])){
                                $property['outer_join'] = $mql_node['outer_join'];
                        }
            
            $schema = $property['schema'];
            if (isset($schema['direction'])) {
                                $direction = $schema['direction'];
                if ($direction === 'referenced<-referencing'){
                    $index_columns = array();
                    $index_columns_string = '';
                    foreach ($schema['join_condition'] as $columns) {
                        $column_ref = $t_alias.'.'.$columns['referenced_column'];
                        if (isset($select[$column_ref])) {
                                                        $c_alias = $select[$column_ref];
                        }
                                                else {
                            $c_alias = $t_alias.get_c_alias();
                            $select[$column_ref] = $c_alias;
                                                }
                        $index_columns_string .= $c_alias;
                        $index_columns[] = $c_alias;
                    }
                    if (!isset($indexes[$index_columns_string])){
                        $indexes[$index_columns_string] = array(
                            'columns'   =>  $index_columns
                        ,   'entries'   =>  array()
                        );
                    }
                    $merge_into = array(
                        'query_index'   =>  $query_index                  
                    ,   'index'         =>  $index_columns_string
                    ,   'columns'       =>  array()
                    );
                    $new_query_index = count($queries);
                }
                else 
                if ($direction === 'referencing->referenced') {
                    $merge_into = NULL;
                    $new_query_index = $query_index;
                }            
                $property['query_index'] = $new_query_index;
                generate_sql($property, $queries, $new_query_index, $t_alias, $merge_into);
            }
            else 
            if ($column_name = $schema['column_name']){
                if ($property['is_filter']) {        
                    handle_filter_property($queries, $query_index, $t_alias, $column_name, $property);
                }
                else {
                    handle_non_filter_property($t_alias, $column_name, $select, $property);
                }
            }
        }
    }
    else 
    if (array_key_exists('default_property', $schema_type)) {
        $default_property_name = $schema_type['default_property'];
        $properties = $schema_type['properties'];
        if (!array_key_exists($default_property_name, $properties)) {
            exit('Default property "'.$default_property_name.'" specified but not found in "/'.$domain_name.'/'.$type_name.'"');
        }
        $default_property = $properties[$default_property_name];
        $column_name = $default_property['column_name'];
        $property = &$mql_node;
        $schema = &$property['schema'];
        $schema['type'] = $default_property['type'];
        if ($property['is_filter']) {        
            handle_filter_property($where, $params, $t_alias, $column_name, $property);
        }
        else {
            handle_non_filter_property($t_alias, $column_name, $select, $property);
        }
    }
*/
}//eof generate sql
/*****************************************************************************
*   Execute Query / Render Result
******************************************************************************/



function execute_sql_queries(sql_queries) {
	
	// TO DO
	
	
	
	
	
	
	
	return null; //TEMP
/*	
    foreach($sql_queries as $sql_query_index => &$sql_query){
    
        $indexes = &$sql_query['indexes'];
                
        $mql_node = $sql_query['mql_node'];
        get_result_object($mql_node, $sql_query_index);
        $result_object = $mql_node['result_object'];
                
        if ($merge_into = $sql_query['merge_into']) {
            $merge_into_columns = $merge_into['columns'];
            $select_columns = $sql_query['select'];
            $merge_into_values_new = array();
            $merge_into_values_old = array();
            $offset = -1;

            $index_name = $merge_into['index'];
            $index = $sql_queries[$merge_into['query_index']]['indexes'][$index_name];
            $index_columns = $index['columns'];
            $extra_from_line = array(
                'table' => $index['inline_table']
            ,   'alias' => $index_name
            );
            $join_condition = '';
            foreach ($index_columns as $position => $index_column) {
                $join_condition .= ($join_condition==='' ? 'ON' : "\nAND").' '
                                .   $index_name.'.'.$index_column.' = '
                                .   array_search($merge_into_columns[$position], $select_columns, TRUE)
                                ;
            }
            $from = &$sql_query['from'];
                        //php guru's, isn't the a func to get the first element of an array?
                        foreach ($from as &$first_from_line) { break; }
            $first_from_line['join_condition'] = $join_condition;
            $first_from_line['join_type'] = 'INNER';
            array_unshift($from, $extra_from_line);            
        }
        
        $result = &$sql_query['results'];
        $rows = execute_sql_query($sql_query);
        foreach($rows as $row_index => $row){
            if ($merge_into){            
                foreach ($merge_into_columns as $col_index => $alias){
                    $merge_into_values_new[$col_index] = $row[$alias];
                }
                if ($merge_into_values_new !== $merge_into_values_old){
                    merge_results($sql_queries, $sql_query_index, $merge_into_values_old, $offset, $row_index);
                    $offset = $row_index;
                }
                $merge_into_values_old = $merge_into_values_new;
            }
            fill_result_object($mql_node, $sql_query_index, $row, $result_object);
            $result[$row_index] = $result_object;
            add_entry_to_indexes($indexes, $row_index, $row);
        }
        create_inline_tables_for_indexes($indexes);
        if (isset($merge_into_values_old) && count($merge_into_values_old)) {
            merge_results($sql_queries, $sql_query_index, $merge_into_values_old, $offset, $row_index);
        }
    }
*/
}//eof execute_sql_queries
/*****************************************************************************
*   Queries
******************************************************************************/
function handle_query(metadata, query_decode, args, cb, query_key) {
	console.log('>>> inside handle_query'); // for testing only 
	query_key = typeof query_key !== 'undefined' ? query_key : 0; // default value of 0 for optional parameter
	if(typeof(args.debug_info) != 'undefined') {
    	var debug_info = args['debug_info'];
	} 
	else { 
		var debug_info = false;
	}
	console.log('debug_info:'); // for testing only	
	console.log(debug_info); // for testing only
	
	if(typeof(args.noexecute) != 'undefined') {
    	var noexecute = args['noexecute'];
	} 
	else { 
		var noexecute = false;
	}
	console.log('noexecute:'); // for testing only	
	console.log(noexecute); // for testing only
	if (debug_info) {
		callstack_push('begin query #'+query_key);
	}
	console.log('query_decode:'); // for testing only	
	console.log(query_decode); // for testing only	
	//check if the query is an object
    if (!is_object(query_decode)) {
        console.log('query_decode is not an object.');
		console.log(query_decode); // for testing only
		cb(null);
    } 
	else {
		var mql_query = query_decode;
		console.log('mql_query:'); // for testing only	
		console.log(mql_query); // for testing only
		var parent = new Array();
		var schema = new Array();
		var domain_type = null;
		var domain_type_array;
		var domain = null;
		var type = null;
		var t_alias_id = typeof t_alias_id !== 'undefined' ? t_alias_id : 0;
		var c_alias_id = typeof c_alias_id !== 'undefined' ? c_alias_id : 0;
		var p_id = typeof p_id !== 'undefined' ? p_id : 0;
		var ids = reset_ids(t_alias_id,c_alias_id,p_id);
		t_alias_id = ids[0];
		console.log('t_alias_id:'); // for testing only	
		console.log(t_alias_id); // for testing only
		c_alias_id = ids[1];
		console.log('c_alias_id:'); // for testing only	
		console.log(c_alias_id); // for testing only
		p_id = ids[2];
		console.log('p_id:'); // for testing only	
		console.log(p_id); // for testing only
		console.log('metadata:'); // for testing only	
		console.log(metadata); // for testing only	
		// MQL Domains map to SQL schemas
		// MQL Types map to SQL tables
		// MQL properties can map to two things:
		//   - columns, in case the property type implies a value
		//   - foreign keys, which implement a relationship to a table
		domain_type = query_decode.type;
		console.log('domain_type:'); // for testing only	
		console.log(domain_type); // for testing only
		domain_type_array = domain_type.split("/");
		console.log('domain_type_array:'); // for testing only	
		console.log(domain_type_array); // for testing only		
		domain = domain_type_array[1];
		console.log('domain:'); // for testing only	
		console.log(domain); // for testing only
		type = domain_type_array[2];
		console.log('type:'); // for testing only	
		console.log(type); // for testing only
		schema['domain'] = domain;
		schema['type'] = type;			
		parent['schema'] = schema;
		console.log('parent:'); // for testing only	
		console.log(parent); // for testing only

// WE ARE HERE
		
		process_mql(metadata, mql_query, parent, function(err, processed_mql) {
			
			console.log('processed_mql:'); // for testing only	
			console.log(processed_mql); // for testing only
			
			var sql_queries = null;
			console.log('sql_queries:'); // for testing only	
			console.log(sql_queries); // for testing only	

			// WE ARE HERE ......

			var generated_sql = generate_sql(metadata, parent, sql_queries, 0); // MOST LIKELY THIS NEEDS processed_mql INSTEAD OF parent
			console.log('generated_sql:'); // for testing only	
			console.log(generated_sql); // for testing only	





			var executed_sql_queries = execute_sql_queries(sql_queries);// MOST LIKELY THIS NEEDS generated_sql INSTEAD OF sql_queries
			console.log('executed_sql_queries:'); // for testing only	
			console.log(executed_sql_queries); // for testing only	
			var result = executed_sql_queries[0]['results']; // temp
			console.log('result:'); // for testing only	
			console.log(result); // for testing only		
			var return_value = array({'code': '/api/status/ok', 'result': result});
			if (debug_info) {
				var sql_statements = [];
				for(var i=0; i<sql_queries.length; i++) {
		             sql_statements.push({'statement': sql_queries[i]['sql'],
		                                 'params':  sql_queries[i]['params'] });
		        }
		        args['sql'] = sql_statements;
		        callstack_push('end query #'+$query_key);
		//        args['timing'] = callstack;  // TO DO: We do not have access to this object momentarily, make it work
		    }
			console.log('return_value:'); // for testing only	
			console.log(return_value); // for testing only	
			cb(null, return_value, args);
		});//eof process_mql
	} //eof else
}// eof handle_query
function handle_queries(metadata, query_decode, args, cb){
	var results = [];
	results.push({'code':'/api/status/ok'});
	for(var query_key=0; query_key<query_decode.length; query_key++) {
		handle_query(metadata, query_decode, args, function(err, result){ 
			results[query_key] = result; 
			console.log('results[query_key]:');// for testing only
			console.log(results[query_key]);// for testing only			
		}, query_key);
	}
	cb(null, results, args);
}// eof handle_queries