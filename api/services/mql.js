/*
 * MQL Read and Write Service.
 */
/********************************************************************************************
* MQL READ
*********************************************************************************************/
exports.read = function(req, res) {
	/****************************************************************************
	* Requirements
	*****************************************************************************/
	var sys = require("sys"),  
	    http = require("http"),  
	    url = require("url"),  
	    path = require("path"),  
	    fs = require("fs");
            mysql = require("mysql");
	/****************************************************************************
	* Properties
	*****************************************************************************/	
	function mqlProperties() {
            this.err = null;
            this.req = null;
            this.res = null;
            this.tAliasID = 0;
            this.cAliasID = 0;
            this.pID = 0;
            this.childTAlias = null;
            this.mergeInto = null;
            this.metaDataFileName = null;
            this.metaData = null;
            this.connectionFileName = null;
            this.connection = null;
            this.sqlDialectFileName = null;
            this.dbConnection = null;
            this.args = null;
            this.queryOrQueries = null;
            this.query = null;
            this.queries = null;
            this.callStack = [];
            this.callBackHandleRequest = null;
            this.result = null;  // we are in need of both result and results
            this.results = null; 
            this.queryKey = null;
            this.callBackHandleQueries = null;
            this.parent = null;
            this.callBackHandleQuery = null;
            this.mqlObject = null;
            this.callBackProcessMQL = null;
            this.callBackProcessMQLObject = null;
            this.callBackParentType = null;
            this.parentSchemaType = null;
            this.types = null;
            this.callBackObjectVars = null;
            this.objectVars = null;
            this.starProperty = null; 
            this.callBackPreProcessProperties = null;
            this.propertyKey = null;
            this.propertyValue = null;
            this.propertyPattern = null;
            this.callBackAnalyzeProperty = null;
            this.matches = null;
            this.callBackPregMatchAll = null;
            this.isFilterProperty = null;
            this.analyzedProperty = null;
            this.callBackIsFilterProperty = null;
            this.typeName = null;
            this.analyzedPropertyKey = null;
            this.analyzedPropertyValue = null;
            this.select = null;
	    this.from = null;
	    this.where = null;
	    this.params = null;
	    this.indexes = null;
	}
	/*****************************************************************************
	* Main
	******************************************************************************/
	var mqlProperties = new mqlProperties(); // instantiate the function object holding all properties

	mqlProperties.req = req;
	mqlProperties.res = res;
	
	mqlProperties.metaDataFileName = __dirname + '/../schemas/coreSchema.json'; // TO DO: define in config
	console.log("mqlProperties.metaDataFileName: "); // for testing only
	console.log(mqlProperties.metaDataFileName); // for testing only	

	mqlProperties.metaData = JSON.parse(fs.readFileSync(mqlProperties.metaDataFileName, 'utf8')); // now metaData is set to the schema
	console.log("mqlProperties.metaData:"); // for testing only
	console.log(mqlProperties.metaData); // for testing only
	
	mqlProperties.connectionFileName = __dirname + '/../connections/coreConnection.json'; // TO DO: define in config
	console.log("mqlProperties.connectionFileName:"); // for testing only
	console.log(mqlProperties.connectionFileName); // for testing only
			
	mqlProperties.connection = JSON.parse(fs.readFileSync(mqlProperties.connectionFileName, 'utf8')); // now connection is set to the database connection
	console.log("mqlProperties.connection:"); // for testing only
	console.log(mqlProperties.connection); // for testing only
	
	console.log("mqlProperties.connection.connection_config:"); // for testing only
	console.log(mqlProperties.connection.connection_config); // for testing only
	
	mqlProperties.sqlDialectFileName = __dirname + '/../dialects/'+mqlProperties.connection.connection_config.dsn['db_type']+'Dialect.json';
	console.log('mqlProperties.sqlDialectFileName:');
	console.log(mqlProperties.sqlDialectFileName);
	
	mqlProperties.sqlDialect = JSON.parse(fs.readFileSync(mqlProperties.sqlDialectFileName, 'utf8'));	 // now sqldialect is set to the sql dialect
	console.log("mqlProperties.sqlDialect: "); // for testing only
	console.log(mqlProperties.sqlDialect); // for testing only
	
	var db_connection = require(mqlProperties.connection.connection_config.dsn['db_type']);
	var db_name = mqlProperties.connection.connection_config.dsn['db_name'];
	var host = mqlProperties.connection.connection_config.dsn['host'];
	var port = mqlProperties.connection.connection_config.dsn['port'];
	var username = mqlProperties.connection.connection_config['username'];
	var password = mqlProperties.connection.connection_config['password'];

	var db_connection_string = {};
	db_connection_string['host'] = host;
	db_connection_string['port'] = port;				
	db_connection_string['user'] = username; // NOTE: special name for user
	db_connection_string['password'] = password;
	console.log("db_connection_string: "); // for testing only
	console.log(db_connection_string); // for testing only
	
	var db_connection_created = db_connection.createConnection(db_connection_string)
	console.log("created db_connection."); // for testing only

	var db = db_connection_created.connect();
	console.log("connection: successful"); // for testing only
						
	console.log('mqlProperties.req.method:'); // for testing only	
	console.log(mqlProperties.req.method); // for testing only
	
	switch (mqlProperties.req.method) {
		case 'GET':
	            mqlProperties.args = mqlProperties.req.get();
				console.log('mqlProperties.req.get():'); // for testing only	
				console.log(mqlProperties.req.get()); // for testing only
	            break;
	    case 'POST':
	            mqlProperties.args = mqlProperties.req.body;
				console.log('mqlProperties.req.body:'); // for testing only	
				console.log(mqlProperties.req.body); // for testing only
	            break;
		case 'OPTIONS':
	            mqlProperties.args = mqlProperties.req.body;
				console.log('mqlProperties.req.body:'); // for testing only	
				console.log(mqlProperties.req.body); // for testing only
	            break;	
	    default:
	            console.log('Must use either GET, POST, or OPTIONS');
	}

	handleRequest(mqlProperties, function(err, mqlProperties){		// WE ARE HERE
		mqlProperties.err = err;
		console.log("mqlProperties.err: "); // for testing only
		console.log(mqlProperties.err); // for testing only		
		console.log("mqlProperties.args: "); // for testing only
		console.log(mqlProperties.args); // for testing only
		console.log("mqlProperties.result: "); // for testing only
		console.log(mqlProperties.result); // for testing only
		console.log("mqlProperties.results: "); // for testing only
		console.log(mqlProperties.results); // for testing only		
		// Static for the time being, overwrites collected sql query result
		mqlProperties.result = [
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

		var output = {};	
		
		var service = "mqlread";
		output["service"] = service;

		var error = mqlProperties.err;
		output["error"] = err;
		
		var url = "/services/mql/read";
		output["url"] = url;

		var code = "/api/status/ok";
	    output["code"] = code; // Change depending on success or failure

	    output["result"] = mqlProperties.result; // are we in need of both result and results, or could we do with just results???
		console.log("mqlProperties.result: "); // for testing only
		console.log(mqlProperties.result); // for testing only	
	    output["results"] = mqlProperties.results;	
		console.log("mqlProperties.results: "); // for testing only
		console.log(mqlProperties.results); // for testing only	

		var status = "200 OK"; // Change depending on success or failure
		output["status"] = status;
		
		var transaction_id = "not implemented";
		output["transaction_id"] = transaction_id;

		mqlProperties.res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
		mqlProperties.res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
		mqlProperties.res.header('Access-Control-Allow-Credentials', true);
		mqlProperties.res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS

		if(isObject(mqlProperties.args)) {
			var args = mqlProperties.args; // have to recreate args for next test
			if(typeof(args.sql) != 'undefined'){
				output["sql"] = args['sql'];	
			}
			if (typeof(args.callback) != 'undefined') {
				mqlProperties.res.header('Content-Type', 'text/javascript');
				console.log("output:"); // for testing only
				console.log(output); // for testing only
				mqlProperties.res.send(args.callback+'('+output+')');
		    } 
			else {
				mqlProperties.res.header('Content-Type', 'application/json');
				console.log("output:"); // for testing only
				console.log(output); // for testing only
				mqlProperties.res.send(output);
			}
		}
	    else {
			mqlProperties.res.header('Content-Type', 'application/json');
			console.log("output:"); // for testing only
			console.log(output); // for testing only
			mqlProperties.res.send(output);
	    }
	});//eof handleRequest
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
function handleRequest(mqlProperties, cb){
	console.log('>>> inside handleRequest'); // for testing only
	mqlProperties.callBackHandleRequest = cb;
	console.log("mqlProperties.callBackHandleRequest:"); // for testing only	
	console.log(mqlProperties.callBackHandleRequest); // for testing only	

	if(typeof(mqlProperties.args.mql) != 'undefined') {
		console.log("mqlProperties.args.mql:"); // for testing only	
		console.log(mqlProperties.args.mql); // for testing only	
			
		if(typeof(mqlProperties.args.mql.query) != 'undefined') {
			console.log('mqlProperties.args.mql.query:'); // for testing only	
			console.log(mqlProperties.args.mql.query); // for testing only
			mqlProperties.queryOrQueries = mqlProperties.args.mql.query;
			console.log('mqlProperties.queryOrQueries:'); // for testing only	
			console.log(mqlProperties.queryOrQueries); // for testing only
			mqlProperties.queryKey = 0; // we have only one result with index 0
			console.log('mqlProperties.queryKey:'); // for testing only	
			console.log(mqlProperties.queryKey); // for testing only
			// NOTE: WE ROUTE QUERY AND QUERIES BOTH THROUGH HANDLEQUERIES, WHICH IN TURN ROUTES IT THROUGH HANDLEQUERY
			handleQueries(mqlProperties, function(err, mqlProperties) {
				console.log('>>> back inside handleRequest from handleQueries');// for testing only 				
				if(err)
				{
					mqlProperties.err = err;
					console.log('>>> leaving handleRequest with error');// for testing only
					mqlProperties.callBackHandleRequest(err, mqlProperties);
				} 
				else
				{
					mqlProperties.err = err;
					console.log('>>> leaving handleRequest');// for testing only
					mqlProperties.callBackHandleRequest(null, mqlProperties);
				}
			});//eof handleQueries
	    }//eof if on query
	
		if(typeof(mqlProperties.args.mql.queries) != 'undefined') {
			console.log('mqlProperties.args.mql.queries:'); // for testing only	
			console.log(mqlProperties.args.mql.queries); // for testing only
			mqlProperties.queryOrQueries = mqlProperties.args.mql.queries;
			console.log('mqlProperties.queryOrQueries:'); // for testing only	
			console.log(mqlProperties.queryOrQueries); // for testing only			
			handleQueries(mqlProperties, function(err, mqlProperties) {
				console.log('>>> back inside handleRequest from handleQueries');// for testing only 					
				if(err)
				{
					mqlProperties.err = err;
					console.log('>>> leaving handleRequest with error');// for testing only
					mqlProperties.callBackHandleRequest(err, mqlProperties);
				} 
				else
				{
					mqlProperties.err = err;
					console.log('>>> leaving handleRequest');// for testing only
					mqlProperties.callBackHandleRequest(null, mqlProperties);
				}
			});//eof handleQueries
	    }//eof if on queries
	}//eof if on mql
	else
	{
		console.log('No property mql in mqlProperties.args.');// for testing only 
		console.log('>>> leaving handleRequest with error');// for testing only 
		var err = new Error('No property mql in mqlProperties.args.');
		mqlProperties.callBackHandleRequest(err, mqlProperties);
	}//eof else on mql
}// eof handleRequest
/*****************************************************************************
*   Miscellaneous
******************************************************************************/
function isObject (mixed_var) {
  // see http://phpjs.org/functions/isObject/	
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Legaev Andrey
  // +   improved by: Michael White (http://getsprink.com)
  // *     example 1: isObject('23');
  // *     returns 1: false
  // *     example 2: isObject({foo: 'bar'});
  // *     returns 2: true
  // *     example 3: isObject(null);
  // *     returns 3: false
  if (Object.prototype.toString.call(mixed_var) === '[object Array]') {
    return false;
  }
  return mixed_var !== null && typeof mixed_var == 'object';
}//eof isObject
function isArray (mixed_var) {
  return typeof(mixed_var)=='object' && (mixed_var instanceof Array);
}//eof isArray
function getObjectVars (mqlProperties, cb) {
	console.log('>>> inside getObjectVars'); // for testing only
	mqlProperties.callBackObjectVars = cb;	
	console.log('mqlProperties.callBackObjectVars:'); // for testing only
	console.log(mqlProperties.callBackObjectVars); // for testing only		
  // see http://phpjs.org/functions/get_object_vars/	
  // http://kevin.vanzonneveld.net
  // +   original by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: function Myclass () {this.privMethod = function (){}}
  // *     example 1: Myclass.classMethod = function () {}
  // *     example 1: Myclass.prototype.myfunc1 = function () {return(true);};
  // *     example 1: Myclass.prototype.myfunc2 = function () {return(true);}
  // *     example 1: getObjectVars('MyClass')
  // *     returns 1: {}
	mqlProperties.objectVars = {},
    prop = '';
	for (prop in mqlProperties.mqlObject) {
		if (typeof mqlProperties.mqlObject[prop] !== 'function' && prop !== 'prototype') {
			mqlProperties.objectVars[prop] = mqlProperties.mqlObject[prop];
		}
	}
	for (prop in mqlProperties.mqlObject.prototype) {
		if (typeof mqlProperties.mqlObject.prototype[prop] !== 'function') {
			mqlProperties.objectVars[prop] = mqlProperties.mqlObject.prototype[prop];
		}
	}
	console.log('>>> leaving getObjectVars'); // for testing only
	mqlProperties.callBackObjectVars(null, mqlProperties);
} // eof getObjectVars
//function pregMatchAll(property_pattern, property_name, property_value, metaData, object_vars, properties, types, star_property, parent_cb, cb) {
function pregMatchAll(mqlProperties, cb) {
   // see http://coding.pressbin.com/16/Javascript-equivalent-of-PHPs-pregmatchall
	console.log('>>> inside pregMatchAll'); // for testing only
	mqlProperties.callBackPregMatchAll = cb;	
	mqlProperties.matches = new Array();
	
// LOOK THIS OVER:		
	var regexp = new RegExp(mqlProperties.propertyPattern);
	if(regexp.test(mqlProperties.propertyKey)) {
		console.log("found a match for: "+mqlProperties.propertyKey);
		mqlProperties.matches.push(mqlProperties.propertyKey);
                
                //TEMP SOLUTION by wvh: pushing the domain and type into matches
                if (mqlProperties.mql_node) {
                    mqlProperties.matches.push(mqlProperties.mql_node.schema.domain);
                    console.log('mqlProperties.mql_node.schema.domain:'); // for testing only
                    console.log(mqlProperties.mql_node.schema.domain); // for testing only 
                    mqlProperties.matches.push(mqlProperties.mql_node.schema.type);
                    console.log('mqlProperties.mql_node.schema.type:'); // for testing only
                    console.log(mqlProperties.mql_node.schema.type); // for testing only 
                }
                
	}
	else {
		console.log("found no match for: "+mqlProperties.propertyKey);
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
	
	console.log('mqlProperties.matches:'); // for testing only
	console.log(mqlProperties.matches); // for testing only
	console.log('>>> leaving pregMatchAll'); // for testing only
	mqlProperties.callBackPregMatchAll(null, mqlProperties);
}//eof pregMatchAll
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
function callStackPush(name) {
	console.log('>>> inside callStackPush'); // for testing only 
	if(!isObject(callstack))
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
* MQL Processing Functions
******************************************************************************/
//OLD function analyze_type(type, metaData, star_property, parent_cb, cb) {
function analyzeType(mqlProperties, cb) {  
	console.log('>>> inside analyzeType'); // for testing only
        mqlProperties.callBackAnalyzeType = cb;
	console.log('mqlProperties.type:'); // for testing only
	console.log(mqlProperties.type); // for testing only
	console.log('mqlProperties.parent_cb:'); // for testing only
	console.log(mqlProperties.parent_cb); // for testing only
	mqlProperties.type_pattern = mqlProperties.type.toString(); // TEMP SOLUTION, ORIGINAL: '/^\/(\w+)\/(\w+)$/';
        console.log('mqlProperties.type_pattern:'); // for testing only
	console.log(mqlProperties.type_pattern); // for testing only//
	// Explanation:
	// The (\w+) grouping looks for word characters, as denoted by the \w. 
	// The + indicates that one or more word characters must appear (not necessarily the same one)
	// The $ is a literal character. The second (\w+) grouping must be followed by a literal $ character.
//OLD	preg_match_all(type_pattern, type, metaData, object_vars, properties, types, star_property, parent_cb, function(err, matches, property_value, metaData, object_vars, properties, types, star_property, parent_cb){
	pregMatchAll(mqlProperties, function(err, mqlProperties){          
		console.log('mqlProperties.matches:'); // for testing only
		console.log(mqlProperties.matches); // for testing only
		console.log('mqlProperties.property_value:'); // for testing only
		console.log(mqlProperties.property_value); // for testing only
		console.log('mqlProperties.metaData:'); // for testing only
		console.log(mqlProperties.metaData); // for testing only	
		console.log('mqlProperties.object_vars:'); // for testing only
		console.log(mqlProperties.object_vars); // for testing only		
		console.log("mqlProperties.parent['properties']:"); // for testing only
		console.log(mqlProperties.parent['properties']); // for testing only		
		console.log('mqlProperties.types:'); // for testing only
		console.log(mqlProperties.types); // for testing only		
		console.log('mqlProperties.star_property:'); // for testing only
		console.log(mqlProperties.star_property); // for testing only	
		console.log('mqlProperties.parent_cb:'); // for testing only
		console.log(mqlProperties.parent_cb); // for testing only	
	    if (mqlProperties.matches) {
                
                console.log('mqlProperties.matches[1]:'); // for testing only
		console.log(mqlProperties.matches[1]); // for testing only
                console.log('mqlProperties.matches[2]:'); // for testing only
		console.log(mqlProperties.matches[2]); // for testing only                
                
		mqlProperties.type = new Array({'domain': mqlProperties.matches[1],'type': mqlProperties.matches[2]});
		console.log('mqlProperties.type:'); // for testing only
		console.log(mqlProperties.type); // for testing only
	        //OLD cb(null, type, metaData, object_vars, properties, types, star_property, parent_cb);
                console.log('>>> leaving analyzeType'); // for testing only
                mqlProperties.callBackAnalyzeType(null, mqlProperties)
	    } 
	    else {
		mqlProperties.type = false; // a boolean???, should be null surely
		console.log('mqlProperties.type:'); // for testing only
		console.log(mqlProperties.type); // for testing only
	    	//OLD cb(null, type, metaData, object_vars, properties, types, star_property, parent_cb);
                console.log('>>> leaving analyzeType'); // for testing only
                mqlProperties.callBackAnalyzeType(null, mqlProperties)
	    }
	});//eof preg_match_all
}

function isFilterProperty(mqlProperties, cb){  	
	console.log('>>> inside isFilterProperty'); // for testing only 
	mqlProperties.callBackIsFilterProperty = cb;
    if (mqlProperties.propertyValue===null) {
		console.log('mqlProperties.propertyValue is null'); // for testing only
		console.log('>>> leaving isFilterProperty'); // for testing only 
        mqlProperties.callBackIsFilterProperty(null, mqlProperties);
    }
    else if (	isObject(mqlProperties.propertyValue) && 
			count(
				get_object_vars(metaData, parent, property_value, null, function(err, metaData, parent, object_vars, types){
					console.log('mqlProperties.objectVars:'); // for testing only
					console.log(mqlProperties.objectVars); // for testing only
					console.log('count(mqlProperties.objectVars):'); // for testing only
					console.log(count(mqlProperties.objectVars)); // for testing only										
					return count(mqlProperties.objectVars);
				})
			)===0			
		)
	{
		console.log('>>> leaving isFilterProperty'); // for testing only 
        mqlProperties.callBackIsFilterProperty(null, mqlProperties);
    }
    else if (	isArray(mqlProperties.propertyValue) && 
			count(mqlProperties.propertyValue)===0
		) 
	{
		mqlProperties.isFilterProperty= false;
		console.log('count(mqlProperties.propertyValue):'); // for testing only
		console.log(count(mqlProperties.propertyValue)); // for testing only
		console.log('>>> leaving isFilterProperty'); // for testing only 
        mqlProperties.callBackIsFilterProperty(null, mqlProperties);
    }
    else {
		mqlProperties.isFilterProperty= true;
		console.log('mqlProperties.propertyValue is filter property'); // for testing only
		console.log('>>> leaving isFilterProperty'); // for testing only 		
        mqlProperties.callBackIsFilterProperty(null, mqlProperties);
    }
}//eof isFilterProperty

function analyzeProperty(mqlProperties, cb){
	console.log('>>> inside analyzeProperty'); // for testing only 
	mqlProperties.callBackAnalyzeProperty = cb;
        mqlProperties.propertyPattern = mqlProperties.propertyKey; //TEMPORARY FIX, 
	//ORIGINAL '/^(((\w+):)?(((\/\w+\/\w+)\/)?(\w+|\*))(=|<=?|>=?|~=|!=|\|=|!\|=|\?=|!\?=)?)$/';
	console.log('mqlProperties.propertyPattern:'); // for testing only
	console.log(mqlProperties.propertyPattern); // for testing only
	pregMatchAll(mqlProperties, function(err, mqlProperties){		
		console.log('>>> back inside analyzeProperty from pregMatchAll'); // for testing only	
	    if (mqlProperties.matches) {
			console.log('property does match'); // for testing only
			
			
			/// WE ARE HERE !!!!
			
			
			isFilterProperty(mqlProperties, function(err, mqlProperties){
				console.log('>>> back inside analyzeProperty from isFilterProperty'); // for testing only
				if (err) {
					mqlProperties.err = err;
					console.log('>>> leaving analyzeProperty with error');
					mqlProperties.callBackAnalyzeProperty(err, mqlProperties);
				}			
			    mqlProperties.analyzedProperty = new Array({
					'prefix': mqlProperties.matches[3],
					'qualifier': mqlProperties.matches[6],
					'name': mqlProperties.matches[7],
					'operator': mqlProperties.matches[8] = typeof mqlProperties.matches[8] !== 'undefined' ? mqlProperties.matches[8] : null,
					'qualified': mqlProperties.matches[5] = typeof mqlProperties.matches[5] !== 'undefined' ? true : false,
					'value': mqlProperties.propertyValue,
					'is_filter': mqlProperties.isFilterProperty,
					'is_directive': false,
					'schema': null
		        });
				console.log('mqlProperties.analyzedProperty:'); // for testing only
				console.log(mqlProperties.analyzedProperty); // for testing only	
				console.log('>>> leaving analyzeProperty');
				
				// SO FAR SO GOOD !!!

				mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
				
			});//eof isFilterProperty
			// HOW DO WE GET TO analyzed_property HERE ??			
			//var analyzed_property = new Array({}); // TEMP
			//console.log('analyzed_property:'); // for testing only
			//console.log(analyzed_property); // for testing only		
			console.log('>>> leaving analyzeProperty');	
			//parent_cb(null, metaData, parent, object_vars, properties, types, star_property, analyzed_property, property_value);
			mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
	    } 
		else {
			console.log('property does not match'); // for testing only
			console.log('>>> leaving analyzeProperty with error');
			var err = new Error('property does not match');
	    	mqlProperties.callBackAnalyzeProperty(err, mqlProperties);
		}
	});//eof pregMatchAll
	console.log('>>> leaving analyzeProperty');
	mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
}//eof analyzeProperty  

//helper for getParentType
function getTypeFromSchema(mqlProperties, cb) {
	console.log('>>> inside getTypeFromSchema'); // for testing only
	mqlProperties.callBackParentType = cb;
	console.log('mqlProperties.callBackParentType:'); // for testing only
	console.log(mqlProperties.callBackParentType); // for testing only
	var domain = mqlProperties.parent.schema.domain;	
	console.log('domain:'); // for testing only
	console.log(domain); // for testing only
	var type = mqlProperties.parent.schema.type;
	console.log('type:'); // for testing only
	console.log(type); // for testing only		
        var domains = mqlProperties.metaData.domains;
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
			var parent_schema_type = types_type; // FILL WITH RIGHT DETAIL.......... I AM NOT SURE THIS IS RIGHT !!!
			console.log('parent_schema_type:'); // for testing only
			console.log(parent_schema_type); // for testing only
			mqlProperties.parentSchemaType = parent_schema_type;
			console.log('mqlProperties.parentSchemaType:'); // for testing only
			console.log(mqlProperties.parentSchemaType); // for testing only			
			console.log('>>> leaving getTypeFromSchema'); // for testing only		
			mqlProperties.callBackParentType(null, mqlProperties);
	    }
	    else { // type does not exist in schema
			console.log('type \''+type+'\' does not exist in schema'); // for testing only
			console.log('>>> leaving getTypeFromSchema with error'); // for testing only
			var err = new Error('type \''+type+'\' does not exist in schema');
			mqlProperties.err = err;
			mqlProperties.callBackParentType(err, mqlProperties);
	    }
	}
	else { // domain does not exist in schema
		console.log('domain \''+domain+'\' does not exist in schema'); // for testing only
		console.log('>>> leaving getTypeFromSchema with error'); // for testing only
		var err = new Error('domain \''+domain+'\' does not exist in schema');
		mqlProperties.err = err;
		mqlProperties.callBackParentType(err, mqlProperties);
	}   
}//eof getTypeFromSchema

//helper for processMQLObject
function getParentType(mqlProperties, cb) {	
	console.log('>>> inside getParentType'); // for testing only
	mqlProperties.callBackProcessMQLObject = cb;
	console.log('mqlProperties.callBackProcessMQLObject:'); // for testing only
	console.log(mqlProperties.callBackProcessMQLObject); // for testing only	
	// we may need to do this as well: mqlProperties.callBackProcessMQLArray = cb;
	if(typeof(mqlProperties.parent) != 'undefined') {
		console.log('mqlProperties.parent:'); // for testing only
		console.log(mqlProperties.parent); // for testing only		
		if(typeof(mqlProperties.parent.schema) != 'undefined'){
			console.log('mqlProperties.parent.schema:'); // for testing only
			console.log(mqlProperties.parent.schema); // for testing only
			getTypeFromSchema(mqlProperties, function(err, mqlProperties) {				
				console.log('>>> back inside getParentType from getTypeFromSchema'); // for testing only
		        if (!mqlProperties.parentSchemaType) {
		            console.log('The parent type "/'
		            +mqlProperties.parent.schema.domain+'/'+mqlProperties.parent.schema.type
		            +'" was not found in the schema.'
		            +' This indicates a logical error in the schema.'
		            );
					console.log('>>> leaving getParentType with error.'); // for testing only
					var err = new Error('The parent type "/'
		            +mqlProperties.parent.schema.domain+'/'+mqlProperties.parent.schema.type
		            +'" was not found in the schema.'
		            +' This indicates a logical error in the schema.');
					mqlProperties.err = err;
					mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
		        }
		        mqlProperties.types[mqlProperties.parent.schema.type.toString()] = mqlProperties.parentSchemaType;
				console.log('mqlProperties.types:'); // for testing only
				console.log(mqlProperties.types); // for testing only
				console.log('>>> leaving getParentType.'); // for testing only		
				mqlProperties.callBackProcessMQLObject(null, mqlProperties); //TEMP
			});//eof getTypeFromSchema
		}
		else { 
			console.log('mqlProperties.parent.schema is not an object.'); // for testing only
			console.log('>>> leaving getParentType with error.'); // for testing only
			var err = new Error('mqlProperties.parent.schema is not an object.');
			mqlProperties.err = err;
			mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
		}
	} 
	else {
		console.log('mqlProperties.parent is not an object.'); // for testing only
		console.log('>>> leaving getParentType with error.'); // for testing only
		var err = new Error('mqlProperties.parent is not an object.');
		mqlProperties.err = err;
		mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
	}
}//eof getParentType
//helper for process_mql_object
function checkTypes(mqlProperties, cb) {
	console.log('>>> inside checkTypes'); // for testing only   NOTE properties = mqlProperties.parent['properties']
	mqlProperties.callBackProcessMQLObject = cb;
	console.log('mqlProperties.callBackProcessMQLObject:'); // for testing only
	console.log(mqlProperties.callBackProcessMQLObject); // for testing only	
	if(typeof(mqlProperties.types) != 'undefined') {
	    switch (Object.keys(mqlProperties.types).length) {
	        case 0:
	            console.log('Could not find a type. Currently we rely on a known type');
				console.log('>>> leaving checkTypes with error'); // for testing only
				var err = new Error('Could not find a type. Currently we rely on a known type');
				mqlProperties.err = err;
				mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
	        case 1:
	            //assigning the contents of the array to the type variable.
				var types_keys = Object.keys(mqlProperties.types);
				console.log('types_keys:'); // for testing only
				console.log(types_keys); // for testing only			
				for(var i=0; i<Object.keys(types_keys).length; i++) {
					var type_key = Object.keys(mqlProperties.types)[0];
					console.log('type_key:'); // for testing only
					console.log(type_key); // for testing only					
					var type_value = Object.keys(mqlProperties.types)[0];
					console.log('type_value:'); // for testing only
					console.log(type_value); // for testing only
					var checked_types = {};
					checked_types[type_key] = type_value;
					checked_types = [checked_types]; 
					console.log('checked_types:'); // for testing only
					console.log(checked_types); // for testing only
				}
				mqlProperties.types = checked_types;
				console.log('mqlProperties.types:'); // for testing only
				console.log(mqlProperties.types); // for testing only
				console.log('>>> leaving checkTypes'); // for testing only
				mqlProperties.callBackProcessMQLObject(null, mqlProperties); //TEMP
	            break;
	        default:
	            console.log('Found more than one type. Currently we can handle only one type.');
				console.log('>>> leaving checkTypes with error'); // for testing only
				var err = new Error('Found more than one type. Currently we can handle only one type.');
				mqlProperties.err = err;
				mqlProperties.callBackProcessMQLObject(err,mqlProperties); //TEMP
	    }
		console.log('>>> leaving checkTypes'); // for testing only
		mqlProperties.types = checked_types;
		mqlProperties.callBackProcessMQLObject(null, mqlProperties); //TEMP
	} 
	else {
		console.log('types is not an object:');// for testing only
		console.log(mqlProperties.types);// for testing only	
		console.log('>>> leaving checkTypes with error'); // for testing only
		var err = new Error('types is not an object');	
		mqlProperties.err = err;
		mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
	}
}//eof checkTypes







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
function preProcessProperties(mqlProperties, cb) { 
	console.log('>>> inside preProcessProperties'); // for testing only	
	mqlProperties.callBackPreProcessProperties = cb;
	console.log('mqlProperties.callBackPreProcessProperties:'); // for testing only
	console.log(mqlProperties.callBackPreProcessProperties); // for testing only
	console.log('Object.keys(mqlProperties.objectVars).length:'); // for testing only
	console.log(Object.keys(mqlProperties.objectVars).length); // for testing only
	for(var i=0; i<Object.keys(mqlProperties.objectVars).length; i++) {
		console.log('preProcessProperties: ROUND i='+i); // for testing only
        mqlProperties.propertyKey = Object.keys(mqlProperties.objectVars)[i];
		console.log('mqlProperties.propertyKey:'); // for testing only
		console.log(mqlProperties.propertyKey); // for testing only
		mqlProperties.propertyValue = mqlProperties.objectVars[mqlProperties.propertyKey.toString()];
		console.log('mqlProperties.propertyValue:'); // for testing only
		console.log(mqlProperties.propertyValue); // for testing only 
		analyzeProperty(mqlProperties, function(err, mqlProperties){			
			console.log('>>> back inside preProcessProperties from analyzeProperty'); // for testing only
			

							
		/// WE ARE HERE !!!!!!!!!!!!!!!!!!!							
							
							
							
		    if (typeof(mqlProperties.analyzedProperty) != 'undefined'){
	            console.log('mqlProperties.analyzedProperty is valid.');
				console.log("mqlProperties.analyzedProperty[0]['operator']:"); // for testing only
				console.log(mqlProperties.analyzedProperty[0]['operator']); // for testing only			
		
			// SO FAR SO GOOD !!!				

		        if (mqlProperties.analyzedProperty[0]['operator']) {  // We have not come into here yet with our test set       
		            var operator_in = (mqlProperties.analyzedProperty[0]['operator']==='|=')||(mqlProperties.analyzedProperty[0]['operator']==='!|=');
					console.log('operator_in:'); // for testing only
					console.log(operator_in); // for testing only
					console.log("mqlProperties.analyzedProperty[0]['value']:"); // for testing only
					console.log(mqlProperties.analyzedProperty[0]['value']); // for testing only
		            if (mqlProperties.analyzedProperty[0]['value'] === null
		            ||  isObject(mqlProperties.analyzedProperty[0]['value'])
		            || (operator_in && isArray(mqlProperties.analyzedProperty[0]['value']) && count(mqlProperties.analyzedProperty[0]['value'])===0)
		            ){
		                console.log("Operator "+mqlProperties.analyzedProperty[0]['operator']+' '
		                +((mqlProperties.analyzedProperty[0]['operator']==='|=' || mqlProperties.analyzedProperty[0]['operator']==='!|=')
		                ? 'takes a non-empty list of values' 
		                : 'takes a single value (not an object or an array)')
		                );
						var err = new Error("Operator "+mqlProperties.analyzedProperty[0]['operator']+' '
		                +((mqlProperties.analyzedProperty[0]['operator']==='|=' || mqlProperties.analyzedProperty[0]['operator']==='!|=')
		                ? 'takes a non-empty list of values' 
		                : 'takes a single value (not an object or an array)'));
						mqlProperties.callBackPreProcessProperties(err, mqlProperties);
		            }//eof if value
		        }//eof if operator
		
				console.log("mqlProperties.analyzedProperty[0]['qualifier']:"); // for testing only
				console.log(mqlProperties.analyzedProperty[0]['qualifier']); // for testing only
				console.log("mqlProperties.analyzedProperty[0]['name']:"); // for testing only
				console.log(mqlProperties.analyzedProperty[0]['name']); // for testing only	
					
				switch (mqlProperties.analyzedProperty[0]['name']) {
				    case 'type':
				    case 'creator':
				    case 'guid':
				    case 'id':         
				    case 'key':         
				    case 'name':
				    case 'permission':
				    case 'timestamp':
				        if (mqlProperties.analyzedProperty[0]['qualifier']==='') {
				            mqlProperties.analyzedProperty[0]['qualifier'] = '/type/object';
				        }
				        break;
				    case 'limit':
				    case 'optional':
				    case 'return':
				    case 'sort':
				    case '*':
				        if (mqlProperties.analyzedProperty[0]['qualifier']==='' ) {
				            mqlProperties.analyzedProperty[0]['is_directive'] = true;
				            switch (property_name) {
				                case 'optional':
				                    mqlProperties.parent['optional'] = (mqlProperties.analyzedProperty[0]['value']===true || mqlProperties.analyzedProperty[0]['value']==='optional');
				                    break;
				                case '*':
				                    mqlProperties.starProperty = true;
				                    break;
				            }
				        }
				    default: // e.g. when property_name = undefined
				        if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object') {
				            console.log('"'+mqlProperties.analyzedProperty[0]['name']+'" is not a universal property, and may not have the qualifier "'+mqlProperties.analyzedProperty[0]['qualifier']+'".');
							var err = new Error('"'+mqlProperties.analyzedProperty[0]['name']+'" is not a universal property, and may not have the qualifier "'+mqlProperties.analyzedProperty[0]['qualifier']+'".');
							mqlProperties.callBackPreProcessProperties(err, mqlProperties);
				        }
				}//eof switch
				if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object'
		        &&  mqlProperties.analyzedProperty[0]['name'] === 'type'
		        &&  isObject(mqlProperties.analyzedProperty[0]['value'])
		        && !isObject(mqlProperties.types.property_value)
		        ) {     
			
					// WE ARE HERE
					console.log('mqlProperties.analyzedProperty[0]:'); // for testing only
					console.log(mqlProperties.analyzedProperty[0]);
			
		            analyzeType(property_value, metaData, parent, object_vars, properties, types, star_property, function(err, type, metaData, parent, object_vars, properties, types, star_property) {
						console.log('>>> back inside pre_processProperties from analyzeType'); // for testing only
						console.log('type:'); // for testing only
						console.log(type); // for testing only
						console.log('metaData:'); // for testing only
						console.log(metaData); // for testing only
						console.log('parent:'); // for testing only
						console.log(parent); // for testing only
						console.log('object_vars:'); // for testing only
						console.log(object_vars); // for testing only						
						console.log("mqlProperties.parent['properties']:"); // for testing only
						console.log(mqlProperties.parent['properties']); // for testing only						
						console.log('types:'); // for testing only
						console.log(types); // for testing only						
						console.log('star_property:'); // for testing only
						console.log(star_property); // for testing only
				        if (!type) {
			                console.log('"'+mqlProperties.analyzedProperty[0]['value']+'" is not a valid type identifier.');
							var err = new Error('"'+mqlProperties.analyzedProperty[0]['value']+'" is not a valid type identifier.');
							cb(err); //TEMP
			            }
			            var domain = type['domain'];
			            var domain_type = type['type'];
			
						// HOW DO WE GET metaData ??
			
						get_type_from_schema(metaData, parent, domain, domain_type, star_property, function(err, type, star_property){
							console.log('>>> back inside pre_processProperties from get_type_from_schema'); // for testing only
							console.log('metaData:'); // for testing only
							console.log(metaData); // for testing only
							console.log('parent:'); // for testing only
							console.log(parent); // for testing only
							console.log('domain:'); // for testing only
							console.log(domain); // for testing only														
							console.log('domain_type:'); // for testing only
							console.log(domain_type); // for testing only	
							console.log('star_property:'); // for testing only
							console.log(star_property); // for testing only				
							if (!type) {
				                console.log('Type "/'+domain+'/'+domain_type+'" not found in schema.');
								var err = new Error('Type "/'+domain+'/'+domain_type+'" not found in schema.');
								cb(err); // TEMP
				            }
				            types['property_value'] = type;
							console.log('types:'); // for testing only
							console.log(types); // for testing only
							cb(null, types, star_property);
							

						});//eof get_type_from_schema
					});//eof analyzeType					
		        }//eof if            
		        mqlProperties.parent.properties['property_key'] = mqlProperties.analyzedProperty;
				console.log("mqlProperties.parent.properties['property_key']:"); // for testing only
				console.log(mqlProperties.parent.properties['property_key']); // for testing only
				console.log('>>> leaving preProcessProperties'); // for testing only
				mqlProperties.callBackPreProcessProperties(null, mqlProperties); //TEMP
	        }//eof if
			else {
				console.log('property is not valid.');
				var err = new Error('property is not valid.');
				mqlProperties.err = err;
				console.log('>>> leaving preProcessProperties with error'); // for testing only
				mqlProperties.callBackPreProcessProperties(err, mqlProperties);
			}//eof else
		});//eof analyzeProperty
    }//eof for
	if (err) { 
		mqlProperties.err = err;
		console.log('>>> leaving preProcessProperties with error'); // for testing only
		mqlProperties.callBackPreProcessProperties(err, mqlProperties);
	}
	else {
		console.log('>>> leaving preProcessProperties'); // for testing only
		mqlProperties.callBackPreProcessProperties(null, mqlProperties);	 //TEMP
	}
}//eof preProcessProperties

//helper for processMQLObject
//function processProperties(&$properties, $type_name, $type) {
function processProperties(mqlProperties, cb) {	
	console.log('>>> inside processProperties');
	mqlProperties.callBackPreProcessProperties = cb;
	// NOTE properties = mqlProperties.analyzedProperty
	console.log('Object.keys(mqlProperties.analyzedProperty).length:');	
	console.log(Object.keys(mqlProperties.analyzedProperty).length);
	for(var i=0; i<Object.keys(mqlProperties.analyzedProperty).length; i++){	/// DOUBLE CHECK: should it be mqlProperties.analyzedProperty[0] ???
		console.log('processProperties: ROUND i='+i); // for testing only
        mqlProperties.analyzedPropertyKey = Object.keys(mqlProperties.analyzedProperty)[i];
		console.log('mqlProperties.analyzedPropertyKey:'); // for testing only
		console.log(mqlProperties.analyzedPropertyKey); // for testing only
		mqlProperties.analyzedPropertyValue = mqlProperties.analyzedProperty[mqlProperties.analyzedPropertyKey.toString()];
		console.log('mqlProperties.analyzedPropertyValue:'); // for testing only
		console.log(mqlProperties.analyzedPropertyValue); // for testing only		
        if (mqlProperties.analyzedPropertyValue['is_directive']===true) {
            continue;
        }		
		console.log("mqlProperties.analyzedPropertyValue['qualifier']"); // for testing only
		console.log(mqlProperties.analyzedPropertyValue['qualifier']); // for testing only
		switch (mqlProperties.analyzedPropertyValue['qualifier']) { 
		    case '/type/object':
				continue;
		    case '':
                var schema_property = mqlProperties.type['properties'][mqlProperties.analyzedPropertyValue['name']];
                if (schema_property) {
                    mqlProperties.analyzedPropertyValue['qualifier'] = mqlProperties.typeName;
                    mqlProperties.analyzedPropertyValue['schema'] = schema_property;
                    if (typeof(schema_property['join_condition']) != 'undefined') {
                        mqlProperties.analyzedPropertyValue['types'] = [schema_property['type']];
                        mqlProperties.propertyValue = mqlProperties.analyzedPropertyValue['value'];
                        if (isObject(mqlProperties.propertyValue) || isArray(mqlProperties.propertyValue)) {
	
                            //process_mql(mqlProperties.propertyValue, mqlProperties.analyzedProperty[0]);
							processMQL(mqlProperties, function(err, mqlProperties){
								console.log('>>> back inside processProperties from processMQL');
								if(err){
									console.log('>>> leaving processProperties with error');
									mqlProperties.err = err;
									mqlProperties.callBackPreProcessProperties(err, mqlProperties);
								}
								else {
									console.log('>>> leaving processProperties');
									mqlProperties.callBackPreProcessProperties(null, mqlProperties);
								}
							});	// eof processMQL
                        }//eof isObject                        
                    }//eof if typeof
                }//eof if schema_property
                else {
                    var err = new Error('No property "'+mqlProperties.analyzedPropertyValue['name']+'" in type "'+mqlProperties.typeName+'".');
					mqlProperties.err = err;
					exit;
                }
                break;
		    default: 
				if (mqlProperties.analyzedPropertyValue['qualifier']!==mqlProperties.analyzedProperty[0].typeName) {
                    var err = new Error('Property "'+mqlProperties.analyzedPropertyValue['qualifier']+'/'+mqlProperties.analyzedPropertyValue['name']
                    +'" does not belong to the type "'+mqlProperties.typeName+'". This feature is not supported yet.');
					mqlProperties.err = err;
					exit;
                }//eof default
		}//eof switch
	}//eof for
	// cb here
}//eof processProperties

function processMQLObject(mqlProperties, cb) {
	console.log('>>> inside processMQLObject'); // for testing only
	mqlProperties.callBackProcessMQL = cb;
	console.log('mqlProperties.callBackProcessMQL:'); // for testing only
	console.log(mqlProperties.callBackProcessMQL); // for testing only
	mqlProperties.mqlObject = mqlProperties.queryOrQueries[0];
	console.log('mqlProperties.mqlObject:'); // for testing only
	console.log(mqlProperties.mqlObject); // for testing only	
	// MQL properties can map to two things:
	//   - columns, in case the property type implies a value
	//   - foreign keys, which implement a relationship to a table
    mqlProperties.parent['properties'] = [];
	console.log('mqlProperties.parent:'); // for testing only
	console.log(mqlProperties.parent); // for testing only
	mqlProperties.types = [];
	console.log('mqlProperties.types:'); // for testing only
	console.log(mqlProperties.types); // for testing only	
	getParentType(mqlProperties, function(err, mqlProperties) {		
		console.log('>>> back inside processMQLObject from getParentType'); // for testing only
		if(err) {
			mqlProperties.err = err;
			console.log('>>> leaving processMQLObject with error'); // for testing only
			mqlProperties.callBackProcessMQL(err, mqlProperties);
		}
		getObjectVars(mqlProperties, function(err, mqlProperties) {			
			console.log('>>> back inside processMQLObject from getObjectVars'); // for testing only
			if(err) {
				mqlProperties.err = err;
				console.log('>>> leaving processMQLObject with error'); // for testing only
				mqlProperties.callBackProcessMQL(err, mqlProperties);
			}
			mqlProperties.starProperty = false;
			preProcessProperties(mqlProperties, function(err, mqlProperties) {				
				console.log('>>> back inside processMQLObject from preProcessProperties'); // for testing only
				if(err) {
					mqlProperties.err = err;
					console.log('>>> leaving processMQLObject with error'); // for testing only
					mqlProperties.callBackProcessMQL(err, mqlProperties);					
				}
				console.log('WE DID: pre_processProperties ... '); // for testing only
				checkTypes(mqlProperties, function(err, mqlProperties) {					
					console.log('>>> back inside processMQLObject from checkTypes'); // for testing only
					if(err) {
						console.log('>>> leaving processMQLObject error'); // for testing only
						mqlProperties.err = err;
						mqlProperties.callBackProcessMQL(err, mqlProperties);
					}
					mqlProperties.typeName = [];
				    for(var i=0; i<mqlProperties.types.length; i++) { //extract the type name
						mqlProperties.typeName[i] = mqlProperties.types[i];
					}
				    mqlProperties.parent['types'] = array_keys(mqlProperties.types);					
				
				    if (mqlProperties.starProperty===true) {
	//			        expand_star(type['properties'], pre_processed_properties ); // TO DO: Make this work
				    }
					console.log('WE DID: checkTypes ... '); // for testing only
					
					// WE ARE HERE ... !!!!!
					// WE ARE HERE ... !!!!!
					// WE ARE HERE ... !!!!!					
					
					processProperties(mqlProperties, function(err, mqlProperties) {
						console.log('>>> back inside processMQLObject from processProperties'); // for testing only
						if(err) {
							console.log('>>> leaving processMQLObject with error');
							mqlProperties.err = err;
							mqlProperties.callBackProcessMQL(err, mqlProperties);
						}
						//console.log('processed_properties:'); // for testing only
						//console.log(processed_properties); // for testing only
						console.log('>>> leaving processMQLObject');
						console.log('WE DID: processProperties ... '); // for testing only						
						//return processed_properties; // TEMP
						mqlProperties.callBackProcessMQL(null, mqlProperties);
					});//eof processProperties
				});//eof checkTypes
			});//eof preProcessProperties
		});//eof getObjectVars
	});//eof getParentType
}//eof processMQLObject

//function processMQLArray(metaData, mql_array, parent, cb) {
function processMQLArray(mqlProperties, cb) {	
	console.log('>>> inside processMQLArray'); // for testing only
	mqlProperties.callBackProcessMQL = cb;
	console.log('mqlProperties.callBackProcessMQL:'); // for testing only
	console.log(mqlProperties.callBackProcessMQL); // for testing only
	mqlProperties.mqlArray = mqlProperties.queryOrQueries[0];
	console.log('mqlProperties.mqlArray:'); // for testing only
	console.log(mqlProperties.mqlArray); // for testing only
	var count = count(mqlProperties.mqlArray);							// TO DO: DOES THIS WORK???
	console.log('count:'); // for testing only
	console.log(count); // for testing only	
    switch (count) {
        case 0:
            break;
        case 1:
            mqlProperties.parent['entries'] = new Array();
            if (array_key_exists('schema', mqlProperties.parent)) {								// TO DO
                mqlProperties.parent['entries']['schema'] = mqlProperties.parent['schema'];
            }
            processMQL(mqlProperties.mqlArray[0], mqlProperties.parent['entries']);				// TO DO
            break;
        default:
            console.log('Expected a dictionary or a list with one element in a read (were you trying to write?)');
			var err = new Error('Expected a dictionary or a list with one element in a read (were you trying to write?)');
			mqlProperties.err = err;
			exit;
    }
	if(mqlProperties.err){
		console.log('>>> leaving processMQLArray with error');
		mqlProperties.callBackProcessMQL(mqlProperties.err, mqlProperties); //TEMPORARY PLACEHOLDER TO FORCE CONTINUATION		
	}
	else {
		console.log('>>> leaving processMQLArray');
		mqlProperties.callBackProcessMQL(null, mqlProperties); //TEMPORARY PLACEHOLDER TO FORCE CONTINUATION
	}
}//eof processMQLArray

function processMQL(mqlProperties, cb) {
	console.log('>>> inside processMQL'); // for testing only
	mqlProperties.callBackHandleQuery = cb;
	console.log('mqlProperties.callBackHandleQuery:'); // for testing only
	console.log(mqlProperties.callBackHandleQuery); // for testing only	

    if (mqlProperties.queryOrQueries[0]===null) {
		console.log('mqlProperties.queryOrQueries[0] is null:'); // for testing only
		console.log(mqlProperties.queryOrQueries[0]); // for testing only
		console.log('>>> leaving processMQL with error'); // for testing only
		var err = new Error('mqlProperties.queryOrQueries[0] is null');
		mqlProperties.err = err;
		mqlProperties.callBackHandleQuery(err, mqlProperties);
    }
    else if (isObject(mqlProperties.queryOrQueries[0])) {
		console.log('mqlProperties.queryOrQueries[0] is an object:'); // for testing only
		console.log(mqlProperties.queryOrQueries[0]); // for testing only		
		processMQLObject(mqlProperties, function(err, mqlProperties) {       ///  WE ARE HERE !!!!!!!!!!
			console.log('>>> back inside processMQL from processMQLObject');	// for testing only
			
			
			
			mqlProperties.err = err;
			console.log('>>> leaving processMQL');	// for testing only
			mqlProperties.callBackHandleQuery(null, mqlProperties);
		});
    }
    else if (isArray(mqlProperties.queryOrQueries[0])) { 
		console.log('mqlProperties.queryOrQueries[0] is an array:'); // for testing only
		console.log(mqlProperties.queryOrQueries[0]); // for testing only	
		processMQLArray(mqlProperties, function(err, mqlProperties) { 
			
			mqlProperties.err = err;
			console.log('>>> leaving processMQL');	// for testing only
			mqlProperties.callBackHandleQuery(null, mqlProperties);
		});
    }
    else {
        console.log('mql query must be an object or an array, not "'+gettype(mqlProperties.queryOrQueries[0])+'":'); // for testing only
		console.log('>>> leaving processMQL with error'); // for testing only
		var err = new Error('mql query must be an object or an array, not "'+gettype(mqlProperties.queryOrQueries[0])+'"');
		mqlProperties.err = err;
		mqlProperties.callBackHandleQuery(err, mqlProperties);
    }
}//eof processMQL
/*****************************************************************************
*   SQL Generation Functions
******************************************************************************/
function resetIDs(mqlProperties){
    console.log('>>> inside resetIDs'); // for testing only    
    mqlProperties.tAliasID = 0;
    mqlProperties.cAliasID = 0;    
    mqlProperties.pID = 0;
    console.log('>>> leaving resetIDs'); // for testing only       
    return mqlProperties;
}//eof resetIDs

function getTAlias(mqlProperties){
    console.log('>>> inside getTAlias'); // for testing only
    mqlProperties.tAliasID = mqlProperties.tAliasID + 1;
    mqlProperties.tAlias = 't'+mqlProperties.tAliasID;
    console.log('>>> leaving getTAlias'); // for testing only
    return mqlProperties;
}//eof getTAlias

function getCAlias(mqlProperties, isNew){
    console.log('>>> inside getCAlias'); // for testing only     
    if(typeof(isNew)==='undefined'){
        isNew = true; // set default to true
    }
    if(isNew){
        mqlProperties.cAliasID = mqlProperties.cAliasID + 1;
    }
    mqlProperties.cAlias = 'c'+mqlProperties.cAliasID;
    console.log('>>> leaving getCAlias'); // for testing only    
    return mqlProperties;
}//eof getCAlias

function getPName(mqlProperties){
    console.log('>>> inside getPName'); // for testing only      
    mqlProperties.pID = mqlProperties.pID + 1;
    mqlProperties.pName = 'p'+mqlProperties.pID;
    console.log('>>> leaving getPName'); // for testing only     
    return mqlProperties;
}//eof getPName


//TO DO function is_optional()


function getFromClause(mqlProperties){
    console.log('>>> inside getFromClause'); // for testing only     
    if(typeof(mqlProperties.mql_node['schema']) === 'undefined'){
        mqlProperties.schema = null;
    }
    else {
        mqlProperties.schema = mqlProperties.mql_node['schema'];
    }
    console.log('mqlProperties.schema:');
    console.log(mqlProperties.schema);    
    
    mqlProperties.from = mqlProperties.query[0].from;
    //REPLACES  $from = &$query['from'];
    console.log('mqlProperties.from:');
    console.log(mqlProperties.from); 
    
    mqlProperties.count_from = mqlProperties.query[0].from.length;
    //REPLACES $count_from = count($from);
    console.log('mqlProperties.count_from:');
    console.log(mqlProperties.count_from);   

    mqlProperties.from_line = [];
    //REPLACES $from_line = array();
    console.log('mqlProperties.from_line:');
    console.log(mqlProperties.from_line);  

    mqlProperties.join_condition = '';
    //REPLACES $join_condition = '';
    console.log('mqlProperties.join_condition:');
    console.log(mqlProperties.join_condition);    
    
    // TO DO ...
    
    
    
    
    
    /* REPLACES
    
    if (isset($schema['direction'])) {
                $direction = $schema['direction'];
        if (($optional = is_optional($mql_node))===TRUE){
            $mql_node['outer_join'] = TRUE;
            $outer_join = TRUE;
        }
        else
                if (isset($mql_node['outer_join'])) {
            $outer_join = $mql_node['outer_join'];
        }
                else {
                        $outer_join = FALSE;
                }
        
        $from_line['join_type'] = ($outer_join===TRUE) ? 'LEFT' : 'INNER';

        switch ($direction) {
            case 'referencing->referenced':     //lookup (n:1 relationship)           
                break;
            case 'referenced<-referencing':     //lookdown (1:n relationship) - starts a separate query.
                $select = &$query['select'];
                $order_by = &$query['order_by'];
                $merge_into = &$query['merge_into'];
                $merge_into_columns = &$merge_into['columns'];
                break;
        }

        foreach ($schema['join_condition'] as $columns) {
            $join_condition .= ($join_condition==='')? 'ON':"\nAND";
            switch ($direction){
                case 'referencing->referenced':
                    $referenced_column = $t_alias.'.'.$columns['referenced_column'];

                    if ($outer_join===TRUE && $join_condition === 'ON'){
                        if ($optional===TRUE) {
                            $from_line['optionality_group'] = $t_alias;
                        }
                        else {
                            if ($count_from) {                        
                                $from_line['optionality_group'] = $from[$child_t_alias]['optionality_group'];
                            }
                            else {
                                $from_line['optionality_group'] = $child_t_alias;
                            }
                        }
                        $from_line['optionality_group_column'] = $referenced_column;
                    }

                    $join_condition .= ' '  .$child_t_alias.'.'.$columns['referencing_column']
                                    .  ' = '.$referenced_column;

                    break;
                case 'referenced<-referencing':
                    $column_ref = $t_alias.'.'.$columns['referencing_column'];
                    $alias = $t_alias.get_c_alias();
                    $merge_into_columns[] = $alias;
                    $select[$column_ref] = $alias;
                    $order_by .= ($order_by===''? 'ORDER BY ' : "\n, ");
                    $order_by .= $alias;
                    break;
            }
        }            
    }
    
    
    
    $from_line['table'] = ($schema_name? $schema_name.'.' : '').$table_name;
    $from_line['alias'] = $t_alias;
    if ($join_condition) {
        $from_line['join_condition'] = $join_condition;
    }
    $from[$t_alias] = $from_line;    
    
    */
    
    
    
    
    console.log('>>> leaving getFromClause'); // for testing only  
    return mqlProperties;
}// eof getFromClause





//function generateSQL(metaData, mql_node, queries, query_index, child_t_alias, merge_into) { // child_t_alias and merge_into are optional
	
//helper for HandleQuery	
function generateSQL(mqlProperties, cb) {	
	console.log('>>> inside generateSQL'); // for testing only
	mqlProperties.callBackHandleQuery = cb;	
	mqlProperties.childTAlias = typeof mqlProperties.childTAlias !== 'undefined' ? mqlProperties.childTAlias : null;
	console.log('mqlProperties.childTAlias:'); // for testing only
	console.log(mqlProperties.childTAlias); // for testing only	
	mqlProperties.mergeInto = typeof mqlProperties.mergeInto !== 'undefined' ? mqlProperties.mergeInto : null;	
	console.log('mqlProperties.mergeInto:'); // for testing only
	console.log(mqlProperties.mergeInto); // for testing only
	
	// TO DO

	console.log("mqlProperties.parent['entries']:"); // for testing only
	console.log(mqlProperties.parent['entries']); // for testing only
	
	// NOTE: $mql_node = mqlProperties.parent
    if (typeof(mqlProperties.parent['entries']) != 'undefined') {
        //generateSQL(mqlProperties.parent['entries'], $queries, $query_index, mqlProperties.childTAlias, mqlProperties.mergeInto);
		generateSQL(mqlProperties, function(err, mqlProperties) {
			console.log('>>> back inside generateSQL from generateSQL (itself!)'); // for testing only			
			
			// TO DO			
			
			console.log('>>> leaving generateSQL');
			// callback here
		});//eof generateSQL... a call to itself!
    }//eof if


    if (typeof(mqlProperties.parent['query_index']) == 'undefined'){
        mqlProperties.parent['query_index'] = mqlProperties.queryKey;//WAS $query_index TEMPORARY SET TO mqlProperties.queryKey
		console.log("mqlProperties.parent['query_index']:"); // for testing only
		console.log(mqlProperties.parent['query_index']); // for testing only
    }

	if(typeof(mqlProperties.queries) != 'undefined' && mqlProperties.queries != null) {
		console.log('mqlProperties.queries:');
		console.log(mqlProperties.queries);		
		if(typeof(mqlProperties.queries[mqlProperties.queryKey]) != 'undefined') {
			mqlProperties.query = mqlProperties.queries[mqlProperties.queryKey];
			console.log('mqlProperties.query:');
			console.log(mqlProperties.query);
		}//eof if 
		else {
			mqlProperties.query = null;
			console.log('mqlProperties.query:');
			console.log(mqlProperties.query);
		}//eof else
		
	}//eof if 
	else {
		mqlProperties.queries = [];
    	mqlProperties.query = null;
		console.log('mqlProperties.query:');
		console.log(mqlProperties.query);
	}//eof else
	console.log('mqlProperties.query:'); // for testing only
	console.log(mqlProperties.query); // for testing only
	
    if (!mqlProperties.query){
        mqlProperties.query = new Array({
			'select': [],
			'from' : [],
			'where' : '',
			'order_by' : '',
			'limit' : '',
			'params' : [],
			'mql_node' : mqlProperties.parent,
			'indexes' : [],
			'merge_into' : mqlProperties.mergeInto,
			'results' : []
        });
        mqlProperties.queries[mqlProperties.queryKey] = mqlProperties.query[0];  
		console.log('mqlProperties.queries[mqlProperties.queryKey]:'); // for testing only
		console.log(mqlProperties.queries[mqlProperties.queryKey]); // for testing only      
    }

    mqlProperties.select = mqlProperties.query[0]['select'];
	console.log('mqlProperties.select:'); // for testing only
	console.log(mqlProperties.select); // for testing only
    mqlProperties.from = mqlProperties.query[0]['from'];
	console.log('mqlProperties.from:'); // for testing only
	console.log(mqlProperties.from); // for testing only
    mqlProperties.where = mqlProperties.query[0]['where'];
	console.log('mqlProperties.where:'); // for testing only
	console.log(mqlProperties.where); // for testing only
    mqlProperties.params = mqlProperties.query[0]['params'];
	console.log('mqlProperties.params:'); // for testing only
	console.log(mqlProperties.params); // for testing only
    mqlProperties.mql_node = mqlProperties.query[0]['mql_node'];    
 	console.log('mqlProperties.mql_nodes:'); // for testing only
	console.log(mqlProperties.mql_node); // for testing only  
    mqlProperties.indexes = mqlProperties.query[0]['indexes'];
	console.log('mqlProperties.indexes:'); // for testing only
	console.log(mqlProperties.indexes); // for testing only

        console.log("mqlProperties.mql_node['types'][0]:");
        console.log(mqlProperties.mql_node['types'][0]);
    mqlProperties.type = mqlProperties.mql_node['types'][0]
     	console.log('mqlProperties.type:'); // for testing only
	console.log(mqlProperties.type); // for testing only   
    
    analyzeType(mqlProperties, function (err, mqlProperties) {
        console.log('>>> back inside generateSQL from analyzeType'); // for testing only
        console.log('mqlProperties.type:'); // for testing only
        console.log(mqlProperties.type); // for testing only

        mqlProperties.domain_name = mqlProperties.type[0]['domain'];
            console.log('mqlProperties.domain_name:'); // for testing only
            console.log(mqlProperties.domain_name); // for testing only
        //REPLACES $domain_name = $type['domain'];
        
            console.log('mqlProperties.metaData:'); // for testing only
            console.log(mqlProperties.metaData); // for testing only

        mqlProperties.domains = mqlProperties.metaData['domains']; 
            console.log('mqlProperties.domains:'); // for testing only
            console.log(mqlProperties.domains); // for testing only
        //REPLACES $domains = $metaData['domains'];

        mqlProperties.schema_domain = mqlProperties.domains[mqlProperties.domain_name];
            console.log('mqlProperties.schema_domain:'); // for testing only
            console.log(mqlProperties.schema_domain); // for testing only
        //REPLACES $schema_domain = $domains[$domain_name];

        mqlProperties.type_name = mqlProperties.type[0]['type'];
            console.log('mqlProperties.type_name:'); // for testing only
            console.log(mqlProperties.type_name); // for testing only    
        //REPLACES $type_name = $type['type'];

        mqlProperties.schema_type = mqlProperties.schema_domain['types'][mqlProperties.type_name];
            console.log('mqlProperties.schema_type:'); // for testing only
            console.log(mqlProperties.schema_type); // for testing only     
        //REPLACES $schema_type = $schema_domain['types'][$type_name];

        //table_name is either explicitly specified, or we take the type name
        if(typeof(mqlProperties.schema_type['table_name']) === 'undefined'){
            mqlProperties.table_name = mqlProperties.type_name;
        }
        else {
            mqlProperties.table_name = mqlProperties.schema_type['table_name'];
        }
            console.log('mqlProperties.table_name:'); // for testing only
            console.log(mqlProperties.table_name); // for testing only   
            //     
        //schema_name is either explicitly specified, or we take the domain name
        if(typeof(mqlProperties.schema_type['schema_name']) === 'undefined'){
            if(typeof(mqlProperties.schema_domain['schema_name']) === 'undefined'){
                //schema_name not defined, settle for the domain name
                mqlProperties.schema_name = mqlProperties.domain_name;
            }
            else { //schema_name is defined at the domain level 
                mqlProperties.schema_name = mqlProperties.schema_domain['schema_name'];
            }
        }
        else { //schema_name is defined at the type level
            mqlProperties.schema_name = mqlProperties.schema_type['schema_name'];
        }
            console.log('mqlProperties.schema_name:'); // for testing only
            console.log(mqlProperties.schema_name); // for testing only        
        
        mqlProperties = getTAlias(mqlProperties);
            console.log('mqlProperties.tAlias:'); // for testing only
            console.log(mqlProperties.tAlias); // for testing only  
        //REPLACES $t_alias = get_t_alias();
        
         
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************        
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************
            // WE ARE HERE ............************************************ 
            
        
        mqlProperties = getFromClause(mqlProperties);
            //console.log('mqlProperties:'); // for testing only
            //console.log(mqlProperties); // for testing only  
        //REPLACES get_from_clause($mql_node, $t_alias, $child_t_alias, $schema_name, $table_name, $query);
        
        
        
 /*       
        
        
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
                    generateSQL($property, $queries, $new_query_index, $t_alias, $merge_into);
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
            console.log('>>> leaving generateSQL');
            mqlProperties.callBackHandleQuery(null, mqlProperties); //TEMPORARY PLACEHOLDER TO FORCE A RETURN





        
    });//eof analyzeType          
}//eof generateSQL
/*****************************************************************************
*   Execute Query / Render Result
******************************************************************************/



function execute_sql_queries(sql_queries) {
	console.log('>>> inside execute_sql_queries'); // for testing only
	
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
function handleQuery(mqlProperties, cb) {
	console.log('>>> inside handleQuery'); // for testing only 
	mqlProperties.callBackHandleQueries = cb;
	console.log('mqlProperties.callBackHandleQueries:'); // for testing only	
	console.log(mqlProperties.callBackHandleQueries); // for testing only	
	
	
/*	NO NEED FOR THIS HERE
	
	if(typeof(mqlProperties.args.debug_info) != 'undefined') {
    	var debug_info = mqlProperties.args['debug_info'];
	} 
	else { 
		var debug_info = false;
	}
	console.log('debug_info:'); // for testing only	
	console.log(debug_info); // for testing only
	
	if(typeof(mqlProperties.args.noexecute) != 'undefined') {
    	var noexecute = mqlProperties.args['noexecute'];
	} 
	else { 
		var noexecute = false;
	}
	console.log('noexecute:'); // for testing only	
	console.log(noexecute); // for testing only
	
*/	
	
	if(typeof(mqlProperties.args.debug_info) != 'undefined') {
		var unixtime_ms = new Date().getTime();
		var sec = parseInt(unixtime_ms / 1000);
		var name = 'begin query #'+mqlProperties.queryKey;
		var microtime = (unixtime_ms - (sec * 1000))/1000 + ' ' + sec;
	    mqlProperties.callStack.push({"name":name, "microtime":microtime});
		console.log('mqlProperties.callStack:'); // for testing only
		console.log(mqlProperties.callStack); // for testing only
	}
	console.log('mqlProperties.queryOrQueries:'); // for testing only	
	console.log(mqlProperties.queryOrQueries); // for testing only	
	//check if the query is an object
    if (!isObject(mqlProperties.queryOrQueries[0])) { // [0] removes the possible brackets, which would make it a non-object
        console.log('mqlProperties.queryOrQueries[0] is not an object.');
		console.log(mqlProperties.queryOrQueries[0]); // for testing only
		console.log('>>> leaving handleQuery with error.');
		var err = new Error('mqlProperties.queryOrQueries[0] is not an object.');
		mqlProperties.err = err;
		mqlProperties.callBackHandleQueries(err, mqlProperties);
    }// eof if !isObject
	else {
		//var mql_query = mqlProperties.queryOrQueries[0];// [0] removes the possible brackets, which would make it a non-object
		console.log('mqlProperties.queryOrQueries[0]:'); // for testing only	
		console.log(mqlProperties.queryOrQueries[0]); // for testing only
		mqlProperties.parent = new Array();
		
		var schema = new Array();
		var domain_type = null;
		var domain_type_array;
		var domain = null;
		var type = null;
		
		mqlProperties.tAliasID = 0;
		mqlProperties.cAliasID = 0;
		mqlProperties.pAliasID = 0;
			
		// MQL Domains map to SQL schemas
		// MQL Types map to SQL tables
		// MQL properties can map to two things:
		//   - columns, in case the property type implies a value
		//   - foreign keys, which implement a relationship to a table
		domain_type = mqlProperties.queryOrQueries[0].type;
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
		mqlProperties.parent['schema'] = schema;
		console.log('mqlProperties.parent:'); // for testing only	
		console.log(mqlProperties.parent); // for testing only
		processMQL(mqlProperties, function(err, mqlProperties) {
			console.log('>>> back inside handleQuery from processMQL'); // for testing only 			
			if(err){
				console.log('>>> leaving handleQuery with error');
				mqlProperties.err = err;
				mqlProperties.callBackHandleQueries(err, mqlQueries);
			}
			mqlProperties.sqlQueries = null;
			console.log('mqlProperties.sqlQueries:'); // for testing only	
			console.log(mqlProperties.sqlQueries); // for testing only	

//			var generated_sql = generateSQL(mqlProperties.metaData, mqlProperties.parent, mqlProperties.sqlQueries, 0); // MOST LIKELY THIS NEEDS processed_mql INSTEAD OF parent
			
			generateSQL(mqlProperties, function(err, mqlProperties){
				console.log('>>> back inside handleQuery from generateSQL'); // for testing only 				
				if(err){
					console.log('>>> leaving handleQuery with error');
					mqlProperties.err = err;
					mqlProperties.callBackHandleQueries(err, mqlProperties);
				}
				
				
				
				
				
				
						// WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
							






				var executed_sql_queries = execute_sql_queries(sql_queries);// MOST LIKELY THIS NEEDS generated_sql INSTEAD OF sql_queries
				console.log('executed_sql_queries:'); // for testing only	
				console.log(executed_sql_queries); // for testing only	
				var result = executed_sql_queries[0]['results']; // temp
				console.log('result:'); // for testing only	
				console.log(result); // for testing only		
				var return_value = new Array({'code': '/api/status/ok', 'result': result});
				if (debug_info) {
					var sql_statements = [];
					for(var i=0; i<sql_queries.length; i++) {
			             sql_statements.push({'statement': sql_queries[i]['sql'],
			                                 'params':  sql_queries[i]['params'] });
			        }
			        args['sql'] = sql_statements;
					var unixtime_ms = new Date().getTime();
					var sec = parseInt(unixtime_ms / 1000);
					var name = 'end query #'+mqlProperties.queryKey;
					var microtime = (unixtime_ms - (sec * 1000))/1000 + ' ' + sec;
				    mqlProperties.callStack.push({"name":name, "microtime":microtime});
					console.log('mqlProperties.callStack:'); // for testing only
					console.log(mqlProperties.callStack); // for testing only
					mqlProperties.args['timing'] = mqlProperties.callStack;
					console.log("mqlProperties.args['timing']:"); // for testing only
					console.log(mqlProperties.args['timing']); // for testing only
			    }
				console.log('return_value:'); // for testing only	
				console.log(return_value); // for testing only	
				console.log('>>> leaving handleQuery'); // for testing only
				mqlProperties.callBackHandleQueries(null, mqlProperties);
				/// HOORAY, WE MADE IT IF WE HAVE COME ALL THE WAY TO HERE !!!

			});//eof generateSQL
		});//eof processMQL
	} //eof else isObject
}// eof handleQuery
function handleQueries(mqlProperties){
	console.log('>>> inside handleQueries'); // for testing only
	mqlProperties.results = [];
	mqlProperties.results.push({'code':'/api/status/ok'});
	for(var queryKey=0; queryKey<mqlProperties.queryOrQueries.length; queryKey++) { // TO DO: we do not know for sure that this mqlProperties.queryOrQueries.length is working
		mqlProperties.queryKey = queryKey;
		console.log('mqlProperties.queryKey:');// for testing only
		console.log(mqlProperties.queryKey);// for testing only		
		handleQuery(mqlProperties, function(err, mqlProperties){ 
			console.log('>>> back inside handleQueries from handleQuery'); // for testing only			
			mqlProperties.results[mqlProperties.queryKey] = mqlProperties.result;
			console.log('mqlProperties.results[mqlProperties.queryKey]:');// for testing only
			console.log(mqlProperties.results[mqlProperties.queryKey]);// for testing only			
		});
	}
	console.log('>>> leaving handleQueries'); // for testing only
	mqlProperties.callBackHandleRequest(null, mqlProperties);
}// eof handleQueries