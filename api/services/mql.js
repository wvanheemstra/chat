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
	/*****************************************************************************
	*   Main
	******************************************************************************/
	// STEP ONE: Schema
	var metadata_file_name = __dirname + '/../schemas/coreSchema.json'; // TO DO: define in config
	init_metadata(metadata_file_name, function(err, json){
		var metadata = json; // now metadata is set to the schema
		console.log("metadata: "); // for testing only
		console.log(metadata); // for testing only
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
							// STEP FOUR: Handle Request
							handle_request(args, function(err, result, args){
								console.log("args: "); // for testing only
								console.log(args); // for testing only
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
function handle_request(args, cb){
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
					handle_queries(query_decode, args, function(err, result, args) {
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
					handle_query(query_decode, args, function(err, result, args) {
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
*   Misc
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

/*****************************************************************************
*	Benchmarking
******************************************************************************/
function callstack_push(name) {
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
*   Queries
******************************************************************************/
function handle_query(query_decode, args, cb, query_key) {

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
	// TO DO
	var result = ' === SQL RESULT COMES HERE  === '; // temp
	

	if (debug_info) {
        // foreach ($sql_queries as $sql_query_index => $sql_query) {
        //     $sql_statements[] = array(
        //                             'statement' =>  $sql_query['sql']
        //                         ,   'params'    =>  $sql_query['params']
        //                         );
        // }
        // $return_value['sql'] = $sql_statements;
        callstack_push('end query #'+$query_key);
        //$return_value['timing'] = $callstack;
    }
	cb(null, result, args);
}// eof handle_query
function handle_queries(query_decode, args, cb){
	var results = [];
	results.push({'code':'/api/status/ok'});
	for(var query_key=0; i<query_decode.length; query_key++) {
		handle_query(query_decode, args, function(err, result){ 
			results[query_key] = result; 
			console.log('results[query_key]:');// for testing only
			console.log(results[query_key]);// for testing only			
		}, query_key);
	}
	cb(null, results, args);
}// eof handle_queries