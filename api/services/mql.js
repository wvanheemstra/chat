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
            fs = require("fs"),
            mysql = require("mysql");

    var nuodb = require('db-nuodb');
    /* testing the new nuodb */
    /* info to be found here http://nuodb.github.io/node-db-nuodb/ */
    /*
     new nuodb.Database({
     hostname: 'localhost',
     user: 'newAdmin',
     password: 'newAdminPW',
     database: 'test',
     schema: 'test'
     }).connect(function(error) {
     if (error) {
     return console.log("CONNECTION ERROR: " + error);
     } else {
     // 'this' object represents the connection cursor
     }
     });
     */

    new nuodb.Database({
        hostname: 'localhost',
        user: 'dba',
        password: 'goalie',
        database: 'test',
        schema: 'test'
    }).on('error', function(error) {
        console.log('ERROR: ' + error);
    }).on('ready', function(server) {
        console.log('Connected to ' + server.hostname + ' (' + server.version + ')');
    }).connect();

    /****************************************************************************
     * Properties
     *****************************************************************************/
    function mqlProperties() {  // PROBABLY NOT NEEDED TO SET ALL THESE PROPERTIES HERE, AS THEY WILL BE GENERATED DURING THE PROCESS
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
    debug("mqlProperties.metaDataFileName: "); // for testing only
    debug(mqlProperties.metaDataFileName); // for testing only	

    mqlProperties.metaData = JSON.parse(fs.readFileSync(mqlProperties.metaDataFileName, 'utf8')); // now metaData is set to the schema
    debug("mqlProperties.metaData:"); // for testing only
    debug(mqlProperties.metaData); // for testing only

    mqlProperties.connectionFileName = __dirname + '/../connections/coreConnection.json'; // TO DO: define in config
    debug("mqlProperties.connectionFileName:"); // for testing only
    debug(mqlProperties.connectionFileName); // for testing only

    mqlProperties.connection = JSON.parse(fs.readFileSync(mqlProperties.connectionFileName, 'utf8')); // now connection is set to the database connection
    debug("mqlProperties.connection:"); // for testing only
    debug(mqlProperties.connection); // for testing only

    debug("mqlProperties.connection.connection_config:"); // for testing only
    debug(mqlProperties.connection.connection_config); // for testing only

    mqlProperties.sqlDialectFileName = __dirname + '/../dialects/' + mqlProperties.connection.connection_config.dsn['db_type'] + 'Dialect.json';
    debug('mqlProperties.sqlDialectFileName:');
    debug(mqlProperties.sqlDialectFileName);

    mqlProperties.sqlDialect = JSON.parse(fs.readFileSync(mqlProperties.sqlDialectFileName, 'utf8'));	 // now sqldialect is set to the sql dialect
    debug("mqlProperties.sqlDialect: "); // for testing only
    debug(mqlProperties.sqlDialect); // for testing only

    var db_connection = require(mqlProperties.connection.connection_config.dsn['db_type']);
    var db_name = mqlProperties.connection.connection_config.dsn['db_name'];
    var host = mqlProperties.connection.connection_config.dsn['host'];
    var port = mqlProperties.connection.connection_config.dsn['port'];
    var username = mqlProperties.connection.connection_config['username'];
    var password = mqlProperties.connection.connection_config['password'];
    mqlProperties.db_connection = db_connection;

    var db_connection_string = {};
    db_connection_string['host'] = host;
    db_connection_string['port'] = port;
    db_connection_string['user'] = username; // NOTE: special name for user
    db_connection_string['password'] = password;
    debug("db_connection_string: "); // for testing only
    debug(db_connection_string); // for testing only
    mqlProperties.db_connection_string = db_connection_string;

// Don't create a connection yet
//    var db_connection_created = db_connection.createConnection(db_connection_string);
//    debug("created db_connection."); // for testing only
//    mqlProperties.db_connection_created = db_connection_created;

// Don't connect yet
//    var db = db_connection_created.connect();
//    debug("connection: successful"); // for testing only
//    mqlProperties.db = db;

    debug('mqlProperties.req.method:'); // for testing only	
    debug(mqlProperties.req.method); // for testing only

    // FOR TESTING PURPOSES ONLY, IN CASE WE DO NOT RECEIVE THE MESSAGE BODY
    if (typeof(mqlProperties.req.body.length) === 'undefined') {
        debug('NOTE: We use our own request body, as there was not one provided....');
        var temp_req_body = new Array(
                {
                    pagination: {
                        "page": 0,
                        "limit": 10,
                        "sort": 'PersonLastName',
                        "dir": 'ASC'
                    },
                    basicInfo: {
                        "ccoId": 'remoteUser',
                        "prefLang": "eng_GB",
                        "requestStartDate": (new Date()).toISOString(),
                        "requesterApp": 'appName'
                    },
                    mql: {
                        "query": [{
                                "type": "/core/person",
                                "kp_PersonID": 1,
                                "PersonFirstName": null,
                                "PersonLastName": null
                            }]
                    },
                    debug_info: {
                    }
                });
        mqlProperties.req.body = temp_req_body[0];// removes the []
    }//eof if

    switch (mqlProperties.req.method) {
        case 'GET':
            mqlProperties.args = mqlProperties.req.get();
            debug('mqlProperties.req.get():'); // for testing only	
            debug(mqlProperties.req.get()); // for testing only
            break;
        case 'POST':
            mqlProperties.args = mqlProperties.req.body;
            debug('mqlProperties.req.body:'); // for testing only	
            debug(mqlProperties.req.body); // for testing only
            break;
        case 'OPTIONS':
            mqlProperties.args = mqlProperties.req.body;
            debug('mqlProperties.req.body:'); // for testing only	
            debug(mqlProperties.req.body); // for testing only
            break;
        default:
            debug('Must use either GET, POST, or OPTIONS');
    }

    handleRequest(mqlProperties, function(err, mqlProperties) {
        mqlProperties.err = err;
        debug("mqlProperties.err: "); // for testing only
        debug(mqlProperties.err); // for testing only		
        debug("mqlProperties.args: "); // for testing only
        debug(mqlProperties.args); // for testing only
        debug("mqlProperties.result: "); // for testing only
        debug(mqlProperties.result); // for testing only
        debug("mqlProperties.results: "); // for testing only
        debug(mqlProperties.results); // for testing only		
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
        debug("mqlProperties.result: "); // for testing only
        debug(mqlProperties.result); // for testing only	
        output["results"] = mqlProperties.results;
        debug("mqlProperties.results: "); // for testing only
        debug(mqlProperties.results); // for testing only	

        var status = "200 OK"; // Change depending on success or failure
        output["status"] = status;

        var transaction_id = "not implemented";
        output["transaction_id"] = transaction_id;

        mqlProperties.res.header("Access-Control-Allow-Origin", "*"); // to allow cross-domain, replace * with a list of domains is desired.
        mqlProperties.res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
        mqlProperties.res.header('Access-Control-Allow-Credentials', true);
        mqlProperties.res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS'); // ExtJS will sent out OPTIONS

        if (isObject(mqlProperties.args)) {
            var args = mqlProperties.args; // have to recreate args for next test
            if (typeof(args.sql) !== 'undefined') {
                output["sql"] = args['sql'];
            }
            if (typeof(args.callback) !== 'undefined') {
                mqlProperties.res.header('Content-Type', 'text/javascript');
                debug("output:"); // for testing only
                debug(output); // for testing only
                mqlProperties.res.send(args.callback + '(' + output + ')');
            }
            else {
                mqlProperties.res.header('Content-Type', 'application/json');
                debug("output:"); // for testing only
                debug(output); // for testing only
                mqlProperties.res.send(output);
            }
        }
        else {
            mqlProperties.res.header('Content-Type', 'application/json');
            debug("output:"); // for testing only
            debug(output); // for testing only
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
    res.send({service: "mql.write", url
                : "/services/mql/write", info: "mql.write not implemented"});
};//eof export.write
/*****************************************************************************
 *   Handle Request
 ******************************************************************************/
function handleRequest(mqlProperties, cb) {
    debug('>>> inside handleRequest'); // for testing only
    mqlProperties.callBackHandleRequest = cb;
    debug("mqlProperties.callBackHandleRequest:"); // for testing only	
    debug(mqlProperties.callBackHandleRequest); // for testing only	

    if (typeof(mqlProperties.args.mql) !== 'undefined') {
        debug("mqlProperties.args.mql:"); // for testing only	
        debug(mqlProperties.args.mql); // for testing only	

        if (typeof(mqlProperties.args.mql.query) !== 'undefined') {
            debug('mqlProperties.args.mql.query:'); // for testing only	
            debug(mqlProperties.args.mql.query); // for testing only
            mqlProperties.queryOrQueries = mqlProperties.args.mql.query;
            debug('mqlProperties.queryOrQueries:'); // for testing only	
            debug(mqlProperties.queryOrQueries); // for testing only
            mqlProperties.queryKey = 0; // we have only one result with index 0
            debug('mqlProperties.queryKey:'); // for testing only	
            debug(mqlProperties.queryKey); // for testing only
            // NOTE: WE ROUTE QUERY AND QUERIES BOTH THROUGH HANDLEQUERIES, WHICH IN TURN ROUTES IT THROUGH HANDLEQUERY
            handleQueries(mqlProperties, function(err, mqlProperties) {
                debug('>>> back inside handleRequest from handleQueries');// for testing only 				
                if (err)
                {
                    mqlProperties.err = err;
                    debug('>>> leaving handleRequest with error');// for testing only
                    mqlProperties.callBackHandleRequest(err, mqlProperties);
                }
                else
                {
                    mqlProperties.err = err;
                    debug('>>> leaving handleRequest');// for testing only
                    mqlProperties.callBackHandleRequest(null, mqlProperties);
                }
            });//eof handleQueries
        }//eof if on query

        if (typeof(mqlProperties.args.mql.queries) !== 'undefined') {
            debug('mqlProperties.args.mql.queries:'); // for testing only	
            debug(mqlProperties.args.mql.queries); // for testing only
            mqlProperties.queryOrQueries = mqlProperties.args.mql.queries;
            debug('mqlProperties.queryOrQueries:'); // for testing only	
            debug(mqlProperties.queryOrQueries); // for testing only			
            handleQueries(mqlProperties, function(err, mqlProperties) {
                debug('>>> back inside handleRequest from handleQueries');// for testing only 					
                if (err)
                {
                    mqlProperties.err = err;
                    debug('>>> leaving handleRequest with error');// for testing only
                    mqlProperties.callBackHandleRequest(err, mqlProperties);
                }
                else
                {
                    mqlProperties.err = err;
                    debug('>>> leaving handleRequest');// for testing only
                    mqlProperties.callBackHandleRequest(null, mqlProperties);
                }
            });//eof handleQueries
        }//eof if on queries
    }//eof if on mql
    else
    {
        debug('No property mql in mqlProperties.args.');// for testing only 
        debug('>>> leaving handleRequest with error');// for testing only 
        var err = new Error('No property mql in mqlProperties.args.');
        mqlProperties.callBackHandleRequest(err, mqlProperties);
    }//eof else on mql
}// eof handleRequest
/*****************************************************************************
 *   Miscellaneous
 ******************************************************************************/
function debug(message) {
    var debug = true; // switch to log or not log messages     
    if (debug) {
        console.log(message);
    }
}

function isObject(mixed_var) {
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
    return mixed_var !== null && typeof mixed_var === 'object';
}//eof isObject
function isArray(mixed_var) {
    return typeof(mixed_var) === 'object' && (mixed_var instanceof Array);
}//eof isArray


// helper of processMQLObject
function getObjectVars(mqlProperties, cb) {
    debug('>>> inside getObjectVars'); // for testing only
    mqlProperties.callBackProcessMQLObject = cb;
    debug('mqlProperties.callBackProcessMQLObject:'); // for testing only
    debug(mqlProperties.callBackProcessMQLObject); // for testing only		
    // see http://phpjs.org/functions/get_objectVars/	
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
    debug('mqlProperties.objectVars:'); // for testing only
    debug(mqlProperties.objectVars); // for testing only    
    debug('>>> leaving getObjectVars'); // for testing only
    mqlProperties.callBackProcessMQLObject(null, mqlProperties);
} // eof getObjectVars

// helper for isFilterProperty
function countObjectVars(mqlProperties){
    debug('>>> inside countObjectVars'); // for testing only    
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
    debug('mqlProperties.objectVars:');
    debug(mqlProperties.objectVars);
    mqlProperties.count_of_object_vars = Object.keys(mqlProperties.objectVars).length;
    debug('mqlProperties.count_of_object_vars:');
    debug(mqlProperties.count_of_object_vars);
    debug('>>> leaving countObjectVars'); // for testing only 
    return mqlProperties;
}//eof countObjectVars

/* THE NON-CALL BACK FUNCTION pregMatchAll */
function pregMatchAll(mqlProperties, pattern, key, value) {
    debug('>>> inside pregMatchAll'); // for testing only
    debug('pattern:');
    debug(pattern);
    debug('key:');
    debug(key);    
    debug('value:');
    debug(value);      
    
    // DON'T CREATE A NEW matches ARRAY HERE, ONE IS ALREADY PROVIDED BY THE CALLING FUNCTION
    //    mqlProperties.matches = new Array(); // DO WE WANT TO START A NEW ARRAY EACH TIME, OR ADD TO AN EXISTING ONE??

    var regexp = new RegExp(pattern);
    if (regexp.test(key)) {
        debug("found a match for: " + key);
        //mqlProperties.matches.push(key);
        
        // CUSTOM ASSIGNMENT BY wvh
        switch(pattern){
            case 'domain': mqlProperties.matches[1] = value;
                break;
            case 'type': mqlProperties.matches[2] = value;
                break;
            case 'prefix': mqlProperties.matches[3] = value;
                break;
            case 'qualified': mqlProperties.matches[5] = value; 
                break;
            case 'qualifier':  mqlProperties.matches[6] = value;
                break;
            case 'name': mqlProperties.matches[7] = value;
                break;
            case 'operator': mqlProperties.matches[8] = value;
                break;
        }     
        
// THE BELOW IS HANDLED INSIDE analyzeType, not here !!
//        //TEMP SOLUTION by wvh: pushing the domain and type into matches
//        if (mqlProperties.mql_node) {
//            mqlProperties.matches[1] = mqlProperties.mql_node.schema.domain; // Should be set explicitely at index 1
//            debug('mqlProperties.mql_node.schema.domain:'); // for testing only
//            debug(mqlProperties.mql_node.schema.domain); // for testing only 
//            mqlProperties.matches[2] = mqlProperties.mql_node.schema.type; // Should be set explicitely at index 2
//            debug('mqlProperties.mql_node.schema.type:'); // for testing only
//            debug(mqlProperties.mql_node.schema.type); // for testing only 
//        }

    }
    else {
        debug("found no match for: " + key);
    }

    debug('mqlProperties.matches:'); // for testing only
    debug(mqlProperties.matches); // for testing only

    debug('>>> leaving pregMatchAll'); // for testing only
    return mqlProperties;
}//eof pregMatchAll

/* THE ORIGINAL CALL BACK FUNCTION pregMatchAll
 //function pregMatchAll(property_pattern, property_name, property_value, metaData, objectVars, properties, types, star_property, parent_cb, cb) {
 function pregMatchAll(mqlProperties, cb) {
 // see http://coding.pressbin.com/16/Javascript-equivalent-of-PHPs-pregmatchall
 debug('>>> inside pregMatchAll'); // for testing only
 mqlProperties.callBackPregMatchAll = cb;
 mqlProperties.matches = new Array();
 
 // LOOK THIS OVER:		
 var regexp = new RegExp(mqlProperties.propertyPattern);
 if (regexp.test(mqlProperties.propertyKey)) {
 debug("found a match for: " + mqlProperties.propertyKey);
 mqlProperties.matches.push(mqlProperties.propertyKey);
 
 //TEMP SOLUTION by wvh: pushing the domain and type into matches
 if (mqlProperties.mql_node) {
 mqlProperties.matches.push(mqlProperties.mql_node.schema.domain);
 debug('mqlProperties.mql_node.schema.domain:'); // for testing only
 debug(mqlProperties.mql_node.schema.domain); // for testing only 
 mqlProperties.matches.push(mqlProperties.mql_node.schema.type);
 debug('mqlProperties.mql_node.schema.type:'); // for testing only
 debug(mqlProperties.mql_node.schema.type); // for testing only 
 }
 
 }
 else {
 debug("found no match for: " + mqlProperties.propertyKey);
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
 
 debug('mqlProperties.matches:'); // for testing only
 debug(mqlProperties.matches); // for testing only
 debug('>>> leaving pregMatchAll'); // for testing only
 mqlProperties.callBackPregMatchAll(null, mqlProperties);
 }//eof pregMatchAll
 */





function arrayKeys(input, search_value, argStrict) {
    debug('>>> inside arrayKeys'); // for testing only 
    // see http://phpjs.org/functions/arrayKeys/	
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: jd
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   input by: P
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // *     example 1: arrayKeys( {firstname: 'Kevin', surname: 'van Zonneveld'} );
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
                else if (input[key] !== search_value) {
                    include = false;
                }
            }
            if (include) {
                tmp_arr[tmp_arr.length] = key;
            }
        }
    }
    return tmp_arr;
}//eof arrayKeys
/**
 * Unset variables, objects, array elements and object 
 * properties in Javascript much like you can in PHP
 * @author Ahmad Retha
 * @license Public Domain
 */
function unset() {
    debug('>>> inside unset'); // for testing only 
    for (var _i = 0; _i < unset.arguments.length; _i++) {
        //where item to unset is an array element (var[index])
        if (_m === unset.arguments[_i].match(/(\w+)\[(\d+)\]/)) {
            eval(_m[1] + ".splice(" + _m[2] + ", 1);");
            //where item to unset is an object item
        } else if (unset.arguments[_i].match('.')) {
            eval("delete " + unset.arguments[_i] + ";");
            //where item to unset is a normal variable
        } else {
            eval(unset.arguments[_i] + " = undefined;");
        }
    }
}//eof unset
/*****************************************************************************
 *	Benchmarking
 ******************************************************************************/
function callStackPush(name) {
    debug('>>> inside callStackPush'); // for testing only 
    if (!isObject(callstack))
    {
        var callstack = []; // first time creation
    }
    var unixtime_ms = new Date().getTime();
    var sec = parseInt(unixtime_ms / 1000);
    var microtime = (unixtime_ms - (sec * 1000)) / 1000 + ' ' + sec;
    callstack.push({"name": name, "microtime": microtime});
    debug('callstack:'); // for testing only
    debug(callstack); // for testing only	
}
/*****************************************************************************
 * MQL Processing Functions
 ******************************************************************************/
//OLD function analyze_type(type, metaData, star_property, parent_cb, cb) {

/* NON-CALL BACK FUNCTION analyzeType */
function analyzeType(mqlProperties){
    debug('>>> inside analyzeType'); // for testing only    
    debug('mqlProperties.type:'); // for testing only
    debug(mqlProperties.type); // for testing only 
    
    debug('mqlProperties.types_type:'); // for testing only
    debug(mqlProperties.types_type); // for testing only    
    
    mqlProperties.type_pattern = 'type'; //NOTE: GIVEN IT A FIXED PATTERN OF 'type'  //mqlProperties.type.toString(); // TEMP SOLUTION, ORIGINAL: '/^\/(\w+)\/(\w+)$/';
    debug('mqlProperties.type_pattern:'); // for testing only
    debug(mqlProperties.type_pattern); // for testing only//    
    // Explanation:
    // The (\w+) grouping looks for word characters, as denoted by the \w. 
    // The + indicates that one or more word characters must appear (not necessarily the same one)
    // The $ is a literal character. The second (\w+) grouping must be followed by a literal $ character.
    
    debug ('----------------- ANALYZING TYPE: ' + 'type' + ' : '+ mqlProperties.type + ' HERE ---------------------------');
    
    mqlProperties.matches = []; // resets the matches array
    mqlProperties = pregMatchAll(mqlProperties, mqlProperties.type_pattern, 'type', mqlProperties.type); //TEMP SET type TWICE // TO DO: provide right parameter here
    
    debug('mqlProperties.matches:');
    debug(mqlProperties.matches);
    
    if (mqlProperties.matches) {
        
        if(typeof(mqlProperties.matches[1]) === 'undefined'){  // TEMPORARY FIX
            mqlProperties.matches[1] = mqlProperties.domain;
        }
        
        debug('mqlProperties.matches[1]:'); // for testing only
        debug(mqlProperties.matches[1]); // for testing only
        debug('mqlProperties.matches[2]:'); // for testing only
        debug(mqlProperties.matches[2]); // for testing only                
        mqlProperties.type = new Array({'domain': mqlProperties.matches[1], 'type': mqlProperties.matches[2]});
        debug('mqlProperties.type:'); // for testing only
        debug(mqlProperties.type); // for testing only
        //OLD cb(null, type, metaData, objectVars, properties, types, star_property, parent_cb);
        debug('>>> leaving analyzeType'); // for testing only
        // WE HAVE COME TO HERE SO FAR
        return mqlProperties;
    }//eof if
    else {
        mqlProperties.type = false; // a boolean???, should be null surely
        debug('mqlProperties.type:'); // for testing only
        debug(mqlProperties.type); // for testing only
        //OLD cb(null, type, metaData, objectVars, properties, types, star_property, parent_cb);
        debug('>>> leaving analyzeType'); // for testing only
        return mqlProperties;
    }//eof else
}//eof analyzeType


/* ORIGINAL CALL-BACK FUNCTION analyzeType
function analyzeType(mqlProperties, cb) {
    debug('>>> inside analyzeType'); // for testing only
    mqlProperties.callBackAnalyzeType = cb;
    debug('mqlProperties.type:'); // for testing only
    debug(mqlProperties.type); // for testing only
    debug('mqlProperties.parent_cb:'); // for testing only
    debug(mqlProperties.parent_cb); // for testing only
    mqlProperties.type_pattern = mqlProperties.type.toString(); // TEMP SOLUTION, ORIGINAL: '/^\/(\w+)\/(\w+)$/';
    debug('mqlProperties.type_pattern:'); // for testing only
    debug(mqlProperties.type_pattern); // for testing only//
    // Explanation:
    // The (\w+) grouping looks for word characters, as denoted by the \w. 
    // The + indicates that one or more word characters must appear (not necessarily the same one)
    // The $ is a literal character. The second (\w+) grouping must be followed by a literal $ character.
//OLD	preg_match_all(type_pattern, type, metaData, objectVars, properties, types, star_property, parent_cb, function(err, matches, property_value, metaData, objectVars, properties, types, star_property, parent_cb){
    pregMatchAll(mqlProperties, function(err, mqlProperties) {
        debug('mqlProperties.matches:'); // for testing only
        debug(mqlProperties.matches); // for testing only
        debug('mqlProperties.property_value:'); // for testing only
        debug(mqlProperties.property_value); // for testing only
        debug('mqlProperties.metaData:'); // for testing only
        debug(mqlProperties.metaData); // for testing only	
        debug('mqlProperties.objectVars:'); // for testing only
        debug(mqlProperties.objectVars); // for testing only		
        debug("mqlProperties.parent['properties']:"); // for testing only
        debug(mqlProperties.parent['properties']); // for testing only		
        debug('mqlProperties.types:'); // for testing only
        debug(mqlProperties.types); // for testing only		
        debug('mqlProperties.star_property:'); // for testing only
        debug(mqlProperties.star_property); // for testing only	
        debug('mqlProperties.parent_cb:'); // for testing only
        debug(mqlProperties.parent_cb); // for testing only	
        if (mqlProperties.matches) {

            debug('mqlProperties.matches[1]:'); // for testing only
            debug(mqlProperties.matches[1]); // for testing only
            debug('mqlProperties.matches[2]:'); // for testing only
            debug(mqlProperties.matches[2]); // for testing only                

            mqlProperties.type = new Array({'domain': mqlProperties.matches[1], 'type': mqlProperties.matches[2]});
            debug('mqlProperties.type:'); // for testing only
            debug(mqlProperties.type); // for testing only
            //OLD cb(null, type, metaData, objectVars, properties, types, star_property, parent_cb);
            debug('>>> leaving analyzeType'); // for testing only
            mqlProperties.callBackAnalyzeType(null, mqlProperties);
        }
        else {
            mqlProperties.type = false; // a boolean???, should be null surely
            debug('mqlProperties.type:'); // for testing only
            debug(mqlProperties.type); // for testing only
            //OLD cb(null, type, metaData, objectVars, properties, types, star_property, parent_cb);
            debug('>>> leaving analyzeType'); // for testing only
            mqlProperties.callBackAnalyzeType(null, mqlProperties);
        }
    });//eof preg_match_all
}//eof analyzeType
*/

/* NON-CALL BACK FUNCTION isFilterProperty */
function isFilterProperty(mqlProperties) {
    debug('>>> inside isFilterProperty'); // for testing only  

    debug('isObject(mqlProperties.propertyValue):');
    debug(isObject(mqlProperties.propertyValue));
    mqlProperties = countObjectVars(mqlProperties);
    debug('mqlProperties.count_of_object_vars:');
    debug(mqlProperties.count_of_object_vars);

    if (mqlProperties.propertyValue === null) {
        debug('mqlProperties.propertyValue is null'); // for testing only
        mqlProperties.is_filter_property = false; // use underscore notation, otherwise it gets confussed with the function
        debug('mqlProperties.is_filter_property:'); // for testing only
        debug(mqlProperties.is_filter_property); // for testing only          
        debug('>>> leaving isFilterProperty'); // for testing only 
        return mqlProperties;
    }
    // uses a new function countObjectVars() added property count_of_object_vars
    else if (isObject(mqlProperties.propertyValue) && mqlProperties.count_of_object_vars === 0)
    {
        mqlProperties.is_filter_property = false; // use underscore notation, otherwise it gets confussed with the function
        debug('mqlProperties.is_filter_property:'); // for testing only
        debug(mqlProperties.is_filter_property); // for testing only          
        debug('>>> leaving isFilterProperty'); // for testing only 
        return mqlProperties;
    }//eof else if
    else if (isArray(mqlProperties.propertyValue) &&
            Object.keys(mqlProperties.propertyValue).length === 0
            )
    {
        mqlProperties.is_filter_property = false; // use underscore notation, otherwise it gets confussed with the function
        debug('Object.keys(mqlProperties.propertyValue).length:'); // for testing only
        debug(Object.keys(mqlProperties.propertyValue).length); // for testing only
        debug('mqlProperties.is_filter_property:'); // for testing only
        debug(mqlProperties.is_filter_property); // for testing only        
        debug('>>> leaving isFilterProperty'); // for testing only 
        return mqlProperties;
    }
    else {
        mqlProperties.is_filter_property = true; // use underscore notation, otherwise it gets confussed with the function
        debug('mqlProperties.is_filter_property:'); // for testing only
        debug(mqlProperties.is_filter_property); // for testing only  
        debug('>>> leaving isFilterProperty'); // for testing only 		
        return mqlProperties;
    }
}//eof isFilterProperty


/* ORIGINAL CALL BACK FUNCTION isFilterProperty
 function isFilterProperty(mqlProperties, cb) {
 debug('>>> inside isFilterProperty'); // for testing only 
 mqlProperties.callBackIsFilterProperty = cb;
 if (mqlProperties.propertyValue === null) {
 debug('mqlProperties.propertyValue is null'); // for testing only
 debug('>>> leaving isFilterProperty'); // for testing only 
 mqlProperties.callBackIsFilterProperty(null, mqlProperties);
 }
 else if (isObject(mqlProperties.propertyValue) &&
 count(
 get_objectVars(metaData, parent, property_value, null, function(err, metaData, parent, objectVars, types) {
 debug('mqlProperties.objectVars:'); // for testing only
 debug(mqlProperties.objectVars); // for testing only
 debug('count(mqlProperties.objectVars):'); // for testing only
 debug(count(mqlProperties.objectVars)); // for testing only										
 return count(mqlProperties.objectVars);
 })
 ) === 0
 )
 {
 debug('>>> leaving isFilterProperty'); // for testing only 
 mqlProperties.callBackIsFilterProperty(null, mqlProperties);
 }
 else if (isArray(mqlProperties.propertyValue) &&
 count(mqlProperties.propertyValue) === 0
 )
 {
 mqlProperties.isFilterProperty = false;
 debug('count(mqlProperties.propertyValue):'); // for testing only
 debug(count(mqlProperties.propertyValue)); // for testing only
 debug('>>> leaving isFilterProperty'); // for testing only 
 mqlProperties.callBackIsFilterProperty(null, mqlProperties);
 }
 else {
 mqlProperties.isFilterProperty = true;
 debug('mqlProperties.propertyValue is filter property'); // for testing only
 debug('>>> leaving isFilterProperty'); // for testing only 		
 mqlProperties.callBackIsFilterProperty(null, mqlProperties);
 }
 }//eof isFilterProperty
 */

/* THE NON-CALL BACK VERSION of analyzeProperty */
function analyzeProperty(mqlProperties) {
    debug('>>> inside analyzeProperty'); // for testing only     

    mqlProperties.propertyKey = mqlProperties.analyze_property; // ADDED by wvh

    debug('mqlProperties.propertyKey:'); // for testing only
    debug(mqlProperties.propertyKey); // for testing only 

    mqlProperties.propertyPattern = mqlProperties.propertyKey; //TEMPORARY FIX 
    //ORIGINAL '/^(((\w+):)?(((\/\w+\/\w+)\/)?(\w+|\*))(=|<=?|>=?|~=|!=|\|=|!\|=|\?=|!\?=)?)$/';
    debug('mqlProperties.propertyPattern:'); // for testing only
    debug(mqlProperties.propertyPattern); // for testing only
    
    debug('mqlProperties.propertyValue:'); // for testing only
    debug(mqlProperties.propertyValue); // for testing only 
    
    debug ('----------------- ANALYZING PROPERTY: ' + mqlProperties.propertyKey + ' : '+ mqlProperties.propertyValue + ' HERE ---------------------------');

    mqlProperties.matches = []; // resets the matches array

    mqlProperties = pregMatchAll(mqlProperties, mqlProperties.propertyPattern, mqlProperties.propertyKey, mqlProperties.propertyValue); // using the non-call back pregMatchAll() // SEEMS TO WORK!!
    
    debug('mqlProperties.matches:');
    debug(mqlProperties.matches);
    
    if (mqlProperties.matches) {
        debug('property does match'); // for testing only

        mqlProperties = isFilterProperty(mqlProperties); // using the non-call back isFilterProperty()
        
        // NOTE below array does not contain: domain (e.g. 'core') and type (e.g. 'person')
        // THESE ARE SET IN analyzeType AS mqlProperties.type
        mqlProperties.analyzedProperty = new Array({
            'prefix': mqlProperties.matches[3],
            'qualifier': mqlProperties.matches[6],
            'name': mqlProperties.matches[7],
            'operator': mqlProperties.matches[8] = typeof mqlProperties.matches[8] !== 'undefined' ? mqlProperties.matches[8] : null,
            'qualified': mqlProperties.matches[5] = typeof mqlProperties.matches[5] !== 'undefined' ? true : false,
            'value': mqlProperties.propertyValue,
            'is_filter': mqlProperties.is_filter_property,
            'is_directive': false,
            'schema': null
        });
        debug('mqlProperties.analyzedProperty:'); // for testing only
        debug(mqlProperties.analyzedProperty); // for testing only        
        debug('>>> leaving analyzeProperty'); // for testing only     
        return mqlProperties;
    }//eof if
    else {
        debug('property does not match'); // for testing only
        debug('>>> leaving analyzeProperty with error');
        var err = new Error('property does not match');
        mqlProperties.err = err;
        return mqlProperties;
    }//eof else    
}//eof analyzeProperty 


/* THE ORIGINAL analyzeProperty WHEN IT WAS STILL A CALL BACK FUNCTION
 function analyzeProperty(mqlProperties, cb) {
 debug('>>> inside analyzeProperty'); // for testing only 
 mqlProperties.callBackAnalyzeProperty = cb;
 
 mqlProperties.propertyKey = mqlProperties.analyze_property; // ADDED by wvh
 
 debug('mqlProperties.propertyKey:'); // for testing only
 debug(mqlProperties.propertyKey); // for testing only    
 
 mqlProperties.propertyPattern = mqlProperties.propertyKey; //TEMPORARY FIX 
 //ORIGINAL '/^(((\w+):)?(((\/\w+\/\w+)\/)?(\w+|\*))(=|<=?|>=?|~=|!=|\|=|!\|=|\?=|!\?=)?)$/';
 debug('mqlProperties.propertyPattern:'); // for testing only
 debug(mqlProperties.propertyPattern); // for testing only
 pregMatchAll(mqlProperties, function(err, mqlProperties) {
 debug('>>> back inside analyzeProperty from pregMatchAll'); // for testing only	
 if (mqlProperties.matches) {
 debug('property does match'); // for testing only
 
 
 /// WE ARE HERE !!!!
 
 
 isFilterProperty(mqlProperties, function(err, mqlProperties) {
 debug('>>> back inside analyzeProperty from isFilterProperty'); // for testing only
 if (err) {
 mqlProperties.err = err;
 debug('>>> leaving analyzeProperty with error');
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
 debug('mqlProperties.analyzedProperty:'); // for testing only
 debug(mqlProperties.analyzedProperty); // for testing only	
 debug('>>> leaving analyzeProperty');
 
 // SO FAR SO GOOD !!!
 
 mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
 
 });//eof isFilterProperty
 // HOW DO WE GET TO analyzed_property HERE ??			
 //var analyzed_property = new Array({}); // TEMP
 //debug('analyzed_property:'); // for testing only
 //debug(analyzed_property); // for testing only		
 debug('>>> leaving analyzeProperty');
 //parent_cb(null, metaData, parent, objectVars, properties, types, star_property, analyzed_property, property_value);
 mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
 }
 else {
 debug('property does not match'); // for testing only
 debug('>>> leaving analyzeProperty with error');
 var err = new Error('property does not match');
 mqlProperties.callBackAnalyzeProperty(err, mqlProperties);
 }
 });//eof pregMatchAll
 debug('>>> leaving analyzeProperty');
 mqlProperties.callBackAnalyzeProperty(null, mqlProperties);
 }//eof analyzeProperty  
 */


//helper for getParentType
function getTypeFromSchema(mqlProperties, cb) {
    debug('>>> inside getTypeFromSchema'); // for testing only
    mqlProperties.callBackGetParentType = cb;
    debug('mqlProperties.callBackGetParentType:'); // for testing only
    debug(mqlProperties.callBackGetParentType); // for testing only
    var domain = mqlProperties.parent.schema.domain;
    debug('domain:'); // for testing only
    debug(domain); // for testing only
    var type = mqlProperties.parent.schema.type;
    debug('type:'); // for testing only
    debug(type); // for testing only		
    var domains = mqlProperties.metaData.domains;
    debug('domains:'); // for testing only
    debug(domains); // for testing only
    // MQL Domains map to SQL schemas
    // MQL Types map to SQL tables
    // MQL properties can map to two things:
    //   - columns, in case the property type implies a value
    //   - foreign keys, which implement a relationship to a table
    if (typeof(domains[domain.toString()]) !== 'undefined') {
        // domain exists in schema, continue 
        debug('domain \'' + domain + '\' exists in schema'); // for testing only
        var types = domains[domain.toString()]['types'];
        debug('types:'); // for testing only
        debug(types); // for testing only
        if (typeof(types[type.toString()]) !== 'undefined') {
            // type exists in schema, continue 
            debug('type \'' + type + '\' exists in schema'); // for testing only
            var types_type = types[type.toString()];
            debug('types_type:'); // for testing only
            debug(types_type); // for testing only
            var parent_schema_type = types_type; // FILL WITH RIGHT DETAIL.......... I AM NOT SURE THIS IS RIGHT !!!
            debug('parent_schema_type:'); // for testing only
            debug(parent_schema_type); // for testing only
            mqlProperties.parentSchemaType = parent_schema_type;
            debug('mqlProperties.parentSchemaType:'); // for testing only
            debug(mqlProperties.parentSchemaType); // for testing only			
            debug('>>> leaving getTypeFromSchema'); // for testing only		
            mqlProperties.callBackGetParentType(null, mqlProperties);
        }
        else { // type does not exist in schema
            debug('type \'' + type + '\' does not exist in schema'); // for testing only
            debug('>>> leaving getTypeFromSchema with error'); // for testing only
            var err = new Error('type \'' + type + '\' does not exist in schema');
            mqlProperties.err = err;
            mqlProperties.callBackGetParentType(err, mqlProperties);
        }
    }
    else { // domain does not exist in schema
        debug('domain \'' + domain + '\' does not exist in schema'); // for testing only
        debug('>>> leaving getTypeFromSchema with error'); // for testing only
        var err = new Error('domain \'' + domain + '\' does not exist in schema');
        mqlProperties.err = err;
        mqlProperties.callBackGetParentType(err, mqlProperties);
    }
}//eof getTypeFromSchema

//helper for processMQLObject
function getParentType(mqlProperties, cb) {
    debug('>>> inside getParentType'); // for testing only
    mqlProperties.callBackProcessMQLObject = cb;
    debug('mqlProperties.callBackProcessMQLObject:'); // for testing only
    debug(mqlProperties.callBackProcessMQLObject); // for testing only	
    // we may need to do this as well: mqlProperties.callBackProcessMQLArray = cb;
    if (typeof(mqlProperties.parent) !== 'undefined') {
        debug('mqlProperties.parent:'); // for testing only
        debug(mqlProperties.parent); // for testing only		
        if (typeof(mqlProperties.parent.schema) !== 'undefined') {
            debug('mqlProperties.parent.schema:'); // for testing only
            debug(mqlProperties.parent.schema); // for testing only
            getTypeFromSchema(mqlProperties, function(err, mqlProperties) {
                debug('>>> back inside getParentType from getTypeFromSchema'); // for testing only
                if (!mqlProperties.parentSchemaType) {
                    debug('The parent type "/'
                            + mqlProperties.parent.schema.domain + '/' + mqlProperties.parent.schema.type
                            + '" was not found in the schema.'
                            + ' This indicates a logical error in the schema.'
                            );
                    debug('>>> leaving getParentType with error.'); // for testing only
                    var err = new Error('The parent type "/'
                            + mqlProperties.parent.schema.domain + '/' + mqlProperties.parent.schema.type
                            + '" was not found in the schema.'
                            + ' This indicates a logical error in the schema.');
                    mqlProperties.err = err;
                    mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
                }
                mqlProperties.types[mqlProperties.parent.schema.type.toString()] = mqlProperties.parentSchemaType;
                debug('mqlProperties.types:'); // for testing only
                debug(mqlProperties.types); // for testing only
                debug('>>> leaving getParentType.'); // for testing only		
                mqlProperties.callBackProcessMQLObject(null, mqlProperties); //TEMP
            });//eof getTypeFromSchema
        }
        else {
            debug('mqlProperties.parent.schema is not an object.'); // for testing only
            debug('>>> leaving getParentType with error.'); // for testing only
            var err = new Error('mqlProperties.parent.schema is not an object.');
            mqlProperties.err = err;
            mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
        }
    }
    else {
        debug('mqlProperties.parent is not an object.'); // for testing only
        debug('>>> leaving getParentType with error.'); // for testing only
        var err = new Error('mqlProperties.parent is not an object.');
        mqlProperties.err = err;
        mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
    }
}//eof getParentType
//helper for processMQLObject
function checkTypes(mqlProperties, cb) {
    debug('>>> inside checkTypes'); // for testing only   NOTE properties = mqlProperties.parent['properties']
    mqlProperties.callBackProcessMQLObject = cb;
    debug('mqlProperties.callBackProcessMQLObject:'); // for testing only
    debug(mqlProperties.callBackProcessMQLObject); // for testing only	
    if (typeof(mqlProperties.types) !== 'undefined') {
        switch (Object.keys(mqlProperties.types).length) {
            case 0:
                debug('>>> leaving checkTypes with error'); // for testing only
                var err = new Error('Could not find a type. Currently we rely on a known type');
                mqlProperties.err = err;
                debug('>>> leaving checkTypes with error:'); // for testing only               
                debug(err.message);
                mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
            case 1:
                //assigning the contents of the array to the type variable.
                var types_keys = Object.keys(mqlProperties.types);
                debug('types_keys:'); // for testing only
                debug(types_keys); // for testing only			
                for (var i = 0; i < Object.keys(types_keys).length; i++) {
                    var type_key = Object.keys(mqlProperties.types)[0];
                    debug('type_key:'); // for testing only
                    debug(type_key); // for testing only					
                    var type_value = Object.keys(mqlProperties.types)[0];
                    debug('type_value:'); // for testing only
                    debug(type_value); // for testing only
                    var checked_types = {};
                    checked_types[type_key] = type_value;
                    checked_types = [checked_types];
                    debug('checked_types:'); // for testing only
                    debug(checked_types); // for testing only
                }
                mqlProperties.types = checked_types;
                debug('mqlProperties.types:'); // for testing only
                debug(mqlProperties.types); // for testing only
                //
                //
                //
                //debug('>>> leaving checkTypes'); // for testing only
                //mqlProperties.callBackProcessMQLObject(null, mqlProperties); // WE SHOULD NOT BE CALLING BACK FROM HERE
                break;
            default:
                debug('>>> leaving checkTypes with error'); // for testing only
                var err = new Error('Found more than one type. Currently we can handle only one type.');
                mqlProperties.err = err;
                debug('>>> leaving checkTypes with error:'); // for testing only               
                debug(err.message);                
                mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
        }
        debug('>>> leaving checkTypes'); // for testing only        
        mqlProperties.callBackProcessMQLObject(null, mqlProperties); //TEMP
    }
    else {
        debug('types is not an object:');// for testing only
        debug(mqlProperties.types);// for testing only	
        var err = new Error('types is not an object');
        mqlProperties.err = err;
        debug('>>> leaving checkTypes with error:'); // for testing only
        debug(err.message);
        mqlProperties.callBackProcessMQLObject(err, mqlProperties); //TEMP
    }
}//eof checkTypes


//helper for process_mql_object
function expand_star(source_properties, target_properties) {
    debug('>>> inside expand_star'); // for testing only
    var unset_target_properties = unset(target_properties['*']);
    for (var i = 0; i < source_properties.length; i++) {
        var property = source_properties[i];
        if (typeof(target_properties.property_name) !== 'undefined') {
            continue;
        }
        if (typeof(property.column_name) !== 'undefined') {
            target_properties[property_name] = array({
                'is_directive': false,
                'qualifier': '',
                'name': property_name,
                'value': null,
                'is_filter': false,
                'operator': null
            });
        }
    }
    return target_properties; // TEMP
}//eof expand_star


//for-enabled function to callback to analyzeProperty
function forAnalyzeProperty(mqlProperties, item, index) {
    debug('>>> inside forAnalyzeProperty'); // for testing only
    mqlProperties.analyze_property = item;
    debug('mqlProperties.analyze_property:');
    debug(mqlProperties.analyze_property);


    // FOR TESTING ONLY !!!
    // HERE WE ARE TRYING TO MAKE analyzeProperty as a non-callback function

    mqlProperties = analyzeProperty(mqlProperties);

    if (typeof(mqlProperties.analyzedProperty) !== 'undefined') {
        debug('mqlProperties.analyzedProperty is valid.');
        debug("mqlProperties.analyzedProperty[0]['operator']:"); // for testing only
        debug(mqlProperties.analyzedProperty[0]['operator']); // for testing only			

        // SO FAR SO GOOD !!!

        if (mqlProperties.analyzedProperty[0]['operator']) {  // We have not come into here yet with our test set       
            var operator_in = (mqlProperties.analyzedProperty[0]['operator'] === '|=') || (mqlProperties.analyzedProperty[0]['operator'] === '!|=');
            debug('operator_in:'); // for testing only
            debug(operator_in); // for testing only
            debug("mqlProperties.analyzedProperty[0]['value']:"); // for testing only
            debug(mqlProperties.analyzedProperty[0]['value']); // for testing only
            if (mqlProperties.analyzedProperty[0]['value'] === null
                    || isObject(mqlProperties.analyzedProperty[0]['value'])
                    || (operator_in && isArray(mqlProperties.analyzedProperty[0]['value']) && Object.keys(mqlProperties.analyzedProperty[0]['value']).length === 0)
                    ) {
                debug("Operator " + mqlProperties.analyzedProperty[0]['operator'] + ' '
                        + ((mqlProperties.analyzedProperty[0]['operator'] === '|=' || mqlProperties.analyzedProperty[0]['operator'] === '!|=')
                        ? 'takes a non-empty list of values'
                        : 'takes a single value (not an object or an array)')
                        );
                var err = new Error("Operator " + mqlProperties.analyzedProperty[0]['operator'] + ' '
                        + ((mqlProperties.analyzedProperty[0]['operator'] === '|=' || mqlProperties.analyzedProperty[0]['operator'] === '!|=')
                        ? 'takes a non-empty list of values'
                        : 'takes a single value (not an object or an array)'));

                debug('>>> leaving forAnalyzeProperty'); // for testing only
                return mqlProperties;
            }//eof if value
        }//eof if operator

        debug("mqlProperties.analyzedProperty[0]['qualifier']:"); // for testing only
        debug(mqlProperties.analyzedProperty[0]['qualifier']); // for testing only
        debug("mqlProperties.analyzedProperty[0]['name']:"); // for testing only
        debug(mqlProperties.analyzedProperty[0]['name']); // for testing only	

        switch (mqlProperties.analyzedProperty[0]['name']) {
            case 'type':
            case 'creator':
            case 'guid':
            case 'id':
            case 'key':
            case 'name':
            case 'permission':
            case 'timestamp':
                if (mqlProperties.analyzedProperty[0]['qualifier'] === '') {
                    mqlProperties.analyzedProperty[0]['qualifier'] = '/type/object';
                }
                break;
            case 'limit':
            case 'optional':
            case 'return':
            case 'sort':
            case '*':
                if (mqlProperties.analyzedProperty[0]['qualifier'] === '') {
                    mqlProperties.analyzedProperty[0]['is_directive'] = true;
                    switch (property_name) {
                        case 'optional':
                            mqlProperties.parent['optional'] = (mqlProperties.analyzedProperty[0]['value'] === true || mqlProperties.analyzedProperty[0]['value'] === 'optional');
                            break;
                        case '*':
                            mqlProperties.starProperty = true;
                            break;
                    }
                }
            default: // e.g. when property_name = undefined
                if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object') {
                    debug('"' + mqlProperties.analyzedProperty[0]['name'] + '" is not a universal property, and may not have the qualifier "' + mqlProperties.analyzedProperty[0]['qualifier'] + '".');
                    var err = new Error('"' + mqlProperties.analyzedProperty[0]['name'] + '" is not a universal property, and may not have the qualifier "' + mqlProperties.analyzedProperty[0]['qualifier'] + '".');
                    mqlProperties.err = err;
                    debug('>>> leaving forAnalyzeProperty with error'); // for testing only
                    return mqlProperties;
                }
        }//eof switch
        if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object'
                && mqlProperties.analyzedProperty[0]['name'] === 'type'
                && isObject(mqlProperties.analyzedProperty[0]['value'])
                && !isObject(mqlProperties.types.property_value)
                ) {
            debug('mqlProperties.analyzedProperty[0]:'); // for testing only
            debug(mqlProperties.analyzedProperty[0]);

            // THE NEW CALL TO NON-CALL BACK FUNCTION analyzeType
            mqlProperties = analyzeType(mqlProperties);
            
            debug('mqlProperties.type:'); // for testing only
            debug(mqlProperties.type); // for testing only
            debug('mqlProperties.metaData:'); // for testing only
            debug(mqlProperties.metaData); // for testing only
            debug('mqlProperties.parent:'); // for testing only
            debug(mqlProperties.parent); // for testing only
            debug('mqlProperties.objectVars:'); // for testing only
            debug(mqlProperties.objectVars); // for testing only						
            debug("mqlProperties.parent['properties']:"); // for testing only
            debug(mqlProperties.parent['properties']); // for testing only						
            debug('mqlProperties.types:'); // for testing only
            debug(mqlProperties.types); // for testing only						
            debug('mqlProperties.star_property:'); // for testing only
            debug(mqlProperties.star_property); // for testing only
            if (!mqlProperties.type) {
                debug('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
                var err = new Error('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
                mqlProperties.err = err;
                return mqlProperties;
            }
            mqlProperties.domain = mqlProperties.type['domain']; // THIS VALUE IS CURRENTLY NOT SET... See analyzeType
            mqlProperties.domain_type = mqlProperties.type['type']; // THIS VALUE IS SET

            // BELOW get_type_from_schema function SHOULD BE A NON-CALL BACK FUNCTION
            get_type_from_schema(metaData, parent, domain, domain_type, star_property, function(err, type, star_property) {
                debug('>>> back inside forAnalyzeProperty from get_type_from_schema'); // for testing only
                debug('metaData:'); // for testing only
                debug(metaData); // for testing only
                debug('parent:'); // for testing only
                debug(parent); // for testing only
                debug('domain:'); // for testing only
                debug(domain); // for testing only														
                debug('domain_type:'); // for testing only
                debug(domain_type); // for testing only	
                debug('star_property:'); // for testing only
                debug(star_property); // for testing only				
                if (!type) {
                    debug('Type "/' + domain + '/' + domain_type + '" not found in schema.');
                    var err = new Error('Type "/' + domain + '/' + domain_type + '" not found in schema.');
                    cb(err); // TEMP
                }
                types['property_value'] = type;
                debug('types:'); // for testing only
                debug(types); // for testing only
                cb(null, types, star_property);
            });//eof get_type_from_schema            
            
            
            

// BELOW analyzeType function WAS A CALL BACK FUNCTION WHICH WE DON'T WANT
/* THE OLD CALL TO analyzeType
            analyzeType(property_value, metaData, parent, objectVars, properties, types, star_property, function(err, type, metaData, parent, objectVars, properties, types, star_property) {
                debug('>>> back inside forAnalyzeProperty from analyzeType'); // for testing only
                debug('type:'); // for testing only
                debug(type); // for testing only
                debug('metaData:'); // for testing only
                debug(metaData); // for testing only
                debug('parent:'); // for testing only
                debug(parent); // for testing only
                debug('objectVars:'); // for testing only
                debug(objectVars); // for testing only						
                debug("mqlProperties.parent['properties']:"); // for testing only
                debug(mqlProperties.parent['properties']); // for testing only						
                debug('types:'); // for testing only
                debug(types); // for testing only						
                debug('star_property:'); // for testing only
                debug(star_property); // for testing only
                if (!type) {
                    debug('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
                    var err = new Error('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
                    cb(err); //TEMP
                }
                var domain = type['domain'];
                var domain_type = type['type'];

                // HOW DO WE GET metaData ??

                // BELOW get_type_from_schema function SHOULD BE A NON-CALL BACK FUNCTION

                get_type_from_schema(metaData, parent, domain, domain_type, star_property, function(err, type, star_property) {
                    debug('>>> back inside forAnalyzeProperty from get_type_from_schema'); // for testing only
                    debug('metaData:'); // for testing only
                    debug(metaData); // for testing only
                    debug('parent:'); // for testing only
                    debug(parent); // for testing only
                    debug('domain:'); // for testing only
                    debug(domain); // for testing only														
                    debug('domain_type:'); // for testing only
                    debug(domain_type); // for testing only	
                    debug('star_property:'); // for testing only
                    debug(star_property); // for testing only				
                    if (!type) {
                        debug('Type "/' + domain + '/' + domain_type + '" not found in schema.');
                        var err = new Error('Type "/' + domain + '/' + domain_type + '" not found in schema.');
                        cb(err); // TEMP
                    }
                    types['property_value'] = type;
                    debug('types:'); // for testing only
                    debug(types); // for testing only
                    cb(null, types, star_property);


                });//eof get_type_from_schema
            });//eof analyzeType
*/            
            
            
 
            
        }//eof if            
        mqlProperties.parent.properties[mqlProperties.propertyKey] = mqlProperties.analyzedProperty;
        debug("mqlProperties.parent.properties[mqlProperties.propertyKey]:"); // for testing only
        debug(mqlProperties.parent.properties[mqlProperties.propertyKey]); // for testing only
        debug('>>> leaving forAnalyzeProperty'); // for testing only
        return mqlProperties;
    }//eof if
    else {
        debug('property is not valid.');
        var err = new Error('property is not valid.');
        mqlProperties.err = err;
        debug('>>> leaving forAnalyzeProperty with error'); // for testing only
        return mqlProperties;
    }//eof else





    /* THIS IS THE ORIGINAL CALL BACK TO analyzeProperty
     * TEMPORARILY COMMENTED OUT FOR ABOVE EXPERIMENT
     
     
     analyzeProperty(mqlProperties, function(err, mqlProperties) {
     debug('>>> back inside forAnalyzeProperty from analyzeProperty'); // for testing only
     
     if (typeof(mqlProperties.analyzedProperty) !== 'undefined') {
     debug('mqlProperties.analyzedProperty is valid.');
     debug("mqlProperties.analyzedProperty[0]['operator']:"); // for testing only
     debug(mqlProperties.analyzedProperty[0]['operator']); // for testing only			
     
     // SO FAR SO GOOD !!!				
     
     if (mqlProperties.analyzedProperty[0]['operator']) {  // We have not come into here yet with our test set       
     var operator_in = (mqlProperties.analyzedProperty[0]['operator'] === '|=') || (mqlProperties.analyzedProperty[0]['operator'] === '!|=');
     debug('operator_in:'); // for testing only
     debug(operator_in); // for testing only
     debug("mqlProperties.analyzedProperty[0]['value']:"); // for testing only
     debug(mqlProperties.analyzedProperty[0]['value']); // for testing only
     if (mqlProperties.analyzedProperty[0]['value'] === null
     || isObject(mqlProperties.analyzedProperty[0]['value'])
     || (operator_in && isArray(mqlProperties.analyzedProperty[0]['value']) && count(mqlProperties.analyzedProperty[0]['value']) === 0)
     ) {
     debug("Operator " + mqlProperties.analyzedProperty[0]['operator'] + ' '
     + ((mqlProperties.analyzedProperty[0]['operator'] === '|=' || mqlProperties.analyzedProperty[0]['operator'] === '!|=')
     ? 'takes a non-empty list of values'
     : 'takes a single value (not an object or an array)')
     );
     var err = new Error("Operator " + mqlProperties.analyzedProperty[0]['operator'] + ' '
     + ((mqlProperties.analyzedProperty[0]['operator'] === '|=' || mqlProperties.analyzedProperty[0]['operator'] === '!|=')
     ? 'takes a non-empty list of values'
     : 'takes a single value (not an object or an array)'));
     mqlProperties.callBackPreProcessProperties(err, mqlProperties);
     }//eof if value
     }//eof if operator
     
     debug("mqlProperties.analyzedProperty[0]['qualifier']:"); // for testing only
     debug(mqlProperties.analyzedProperty[0]['qualifier']); // for testing only
     debug("mqlProperties.analyzedProperty[0]['name']:"); // for testing only
     debug(mqlProperties.analyzedProperty[0]['name']); // for testing only	
     
     switch (mqlProperties.analyzedProperty[0]['name']) {
     case 'type':
     case 'creator':
     case 'guid':
     case 'id':
     case 'key':
     case 'name':
     case 'permission':
     case 'timestamp':
     if (mqlProperties.analyzedProperty[0]['qualifier'] === '') {
     mqlProperties.analyzedProperty[0]['qualifier'] = '/type/object';
     }
     break;
     case 'limit':
     case 'optional':
     case 'return':
     case 'sort':
     case '*':
     if (mqlProperties.analyzedProperty[0]['qualifier'] === '') {
     mqlProperties.analyzedProperty[0]['is_directive'] = true;
     switch (property_name) {
     case 'optional':
     mqlProperties.parent['optional'] = (mqlProperties.analyzedProperty[0]['value'] === true || mqlProperties.analyzedProperty[0]['value'] === 'optional');
     break;
     case '*':
     mqlProperties.starProperty = true;
     break;
     }
     }
     default: // e.g. when property_name = undefined
     if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object') {
     debug('"' + mqlProperties.analyzedProperty[0]['name'] + '" is not a universal property, and may not have the qualifier "' + mqlProperties.analyzedProperty[0]['qualifier'] + '".');
     var err = new Error('"' + mqlProperties.analyzedProperty[0]['name'] + '" is not a universal property, and may not have the qualifier "' + mqlProperties.analyzedProperty[0]['qualifier'] + '".');
     mqlProperties.callBackPreProcessProperties(err, mqlProperties);
     }
     }//eof switch
     if (mqlProperties.analyzedProperty[0]['qualifier'] === '/type/object'
     && mqlProperties.analyzedProperty[0]['name'] === 'type'
     && isObject(mqlProperties.analyzedProperty[0]['value'])
     && !isObject(mqlProperties.types.property_value)
     ) {
     
     // WE ARE HERE
     debug('mqlProperties.analyzedProperty[0]:'); // for testing only
     debug(mqlProperties.analyzedProperty[0]);
     
     analyzeType(property_value, metaData, parent, objectVars, properties, types, star_property, function(err, type, metaData, parent, objectVars, properties, types, star_property) {
     debug('>>> back inside forAnalyzeProperty from analyzeType'); // for testing only
     debug('type:'); // for testing only
     debug(type); // for testing only
     debug('metaData:'); // for testing only
     debug(metaData); // for testing only
     debug('parent:'); // for testing only
     debug(parent); // for testing only
     debug('objectVars:'); // for testing only
     debug(objectVars); // for testing only						
     debug("mqlProperties.parent['properties']:"); // for testing only
     debug(mqlProperties.parent['properties']); // for testing only						
     debug('types:'); // for testing only
     debug(types); // for testing only						
     debug('star_property:'); // for testing only
     debug(star_property); // for testing only
     if (!type) {
     debug('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
     var err = new Error('"' + mqlProperties.analyzedProperty[0]['value'] + '" is not a valid type identifier.');
     cb(err); //TEMP
     }
     var domain = type['domain'];
     var domain_type = type['type'];
     
     // HOW DO WE GET metaData ??
     
     get_type_from_schema(metaData, parent, domain, domain_type, star_property, function(err, type, star_property) {
     debug('>>> back inside forAnalyzeProperty from get_type_from_schema'); // for testing only
     debug('metaData:'); // for testing only
     debug(metaData); // for testing only
     debug('parent:'); // for testing only
     debug(parent); // for testing only
     debug('domain:'); // for testing only
     debug(domain); // for testing only														
     debug('domain_type:'); // for testing only
     debug(domain_type); // for testing only	
     debug('star_property:'); // for testing only
     debug(star_property); // for testing only				
     if (!type) {
     debug('Type "/' + domain + '/' + domain_type + '" not found in schema.');
     var err = new Error('Type "/' + domain + '/' + domain_type + '" not found in schema.');
     cb(err); // TEMP
     }
     types['property_value'] = type;
     debug('types:'); // for testing only
     debug(types); // for testing only
     cb(null, types, star_property);
     
     
     });//eof get_type_from_schema
     });//eof analyzeType					
     }//eof if            
     mqlProperties.parent.properties['property_key'] = mqlProperties.analyzedProperty;
     debug("mqlProperties.parent.properties['property_key']:"); // for testing only
     debug(mqlProperties.parent.properties['property_key']); // for testing only
     debug('>>> leaving forAnalyzeProperty'); // for testing only
     mqlProperties.callBackPreProcessProperties(null, mqlProperties); //TEMP
     }//eof if
     else {
     debug('property is not valid.');
     var err = new Error('property is not valid.');
     mqlProperties.err = err;
     debug('>>> leaving forAnalyzeProperty with error'); // for testing only
     mqlProperties.callBackPreProcessProperties(err, mqlProperties);
     }//eof else
     });//eof analyzeProperty
      
     
*/

}//eof forAnalyzeProperty

//helper for processMQLObject
function preProcessProperties(mqlProperties, cb) {
    debug('>>> inside preProcessProperties'); // for testing only	
    mqlProperties.callBackProcessMQLObject = cb;
    debug('Object.keys(mqlProperties.objectVars).length:'); // for testing only
    debug(Object.keys(mqlProperties.objectVars).length); // for testing only
    for (var i = 0; i < Object.keys(mqlProperties.objectVars).length; i++) {
        debug('preProcessProperties: start of Round i=' + i); // for testing only
        mqlProperties.propertyKey = Object.keys(mqlProperties.objectVars)[i];
        debug('mqlProperties.propertyKey:'); // for testing only
        debug(mqlProperties.propertyKey); // for testing only
        mqlProperties.propertyValue = mqlProperties.objectVars[mqlProperties.propertyKey.toString()];
        debug('mqlProperties.propertyValue:'); // for testing only
        debug(mqlProperties.propertyValue); // for testing only 
        mqlProperties = forAnalyzeProperty(mqlProperties, Object.keys(mqlProperties.objectVars)[i], i); // call the for-enabled function to callback to analyzeProperty
        debug('>>> preProcessProperties: end of Round i= ' + i);
    }//eof for
    // DO WE NEED TO CALL BACK FROM HERE, ... YES WE DO!!!
    debug("mqlProperties.parent.properties:"); // for testing only
    debug(mqlProperties.parent.properties); // for testing only
    if (mqlProperties.err) {
        debug('>>> leaving preProcessProperties with error'); // for testing only    
        mqlProperties.callBackProcessMQLObject(mqlProperties.err, mqlProperties);
    }
    else {
        debug('>>> leaving preProcessProperties'); // for testing only    
        mqlProperties.callBackProcessMQLObject(null, mqlProperties);
    }
}//eof preProcessProperties

//for-enabled function to callback to processMQL
function forProcessQML(mqlProperties, item, index) {
    debug('>>> inside forProcessQML'); // for testing only
    mqlProperties.process_mql = item;
    debug('mqlProperties.process_mql:');
    debug(mqlProperties.process_mql);

    //process_mql(mqlProperties.propertyValue, mqlProperties.analyzedProperty[0]);
    processMQL(mqlProperties, function(err, mqlProperties) {
        debug('>>> back inside forProcessQML from processMQL');
        if (err) {
            debug('>>> leaving forProcessQML with error');
            mqlProperties.err = err;
            mqlProperties.callBackPreProcessProperties(err, mqlProperties);
        }
        else {
            debug('>>> leaving forProcessQML');
            mqlProperties.callBackPreProcessProperties(null, mqlProperties);
        }
    });	// eof processMQL
}
;//eof forProcessMQL

//helper for processMQLObject
//function processProperties(&$properties, $type_name, $type) {
function processProperties(mqlProperties, cb) {
    debug('>>> inside processProperties');
    //mqlProperties.callBackPreProcessProperties = cb;  // SHOULD THIS INSTEAD BE mqlProperties.callBackProcessProperties = cb; ???
    mqlProperties.callBackProcessMQLObject = cb;
    // NOTE properties = mqlProperties.analyzedProperty
    debug('Object.keys(mqlProperties.analyzedProperty).length:');
    debug(Object.keys(mqlProperties.analyzedProperty).length);
    
    // NOTE it is more likely that we need to loop through mqlProperties.parent.properties
    // instead of through mqlProperties.analyzedProperty
    debug('Object.keys(mqlProperties.parent.properties).length:');
    debug(Object.keys(mqlProperties.parent.properties).length);
    mqlProperties.analyzedProperties = [];
    
    // PERHAPS WE SHOULD THUS USE mqlProperties.parent.properties BELOW AS WELL
//OLD    for (var i = 0; i < Object.keys(mqlProperties.analyzedProperty).length; i++) {	/// DOUBLE CHECK: should it be mqlProperties.analyzedProperty[0] ???
    for (var i = 0; i < Object.keys(mqlProperties.parent.properties).length; i++) {
        debug('processProperties: start of Round i=' + i); // for testing only
//OLD   mqlProperties.analyzedPropertyKey = Object.keys(mqlProperties.analyzedProperty)[i];
        mqlProperties.analyzedPropertyKey = Object.keys(mqlProperties.parent.properties)[i];
        debug('mqlProperties.analyzedPropertyKey:'); // for testing only
        debug(mqlProperties.analyzedPropertyKey); // for testing only
//OLD   mqlProperties.analyzedPropertyValue = mqlProperties.analyzedProperty[mqlProperties.analyzedPropertyKey.toString()];
        mqlProperties.analyzedPropertyValue = mqlProperties.parent.properties[mqlProperties.analyzedPropertyKey.toString()];
        debug('mqlProperties.analyzedPropertyValue:'); // for testing only
        debug(mqlProperties.analyzedPropertyValue); // for testing only		
        if (mqlProperties.analyzedPropertyValue['is_directive'] === true) {
            continue;
        }
        // ADDED BY WVH THIS if TO ALLOW UNDEFINED 'qualifier' TO BE ACCEPTED WITH ''
        if(typeof(mqlProperties.analyzedPropertyValue['qualifier']) === 'undefined'){
            mqlProperties.analyzedPropertyValue['qualifier'] = '';
        }
        debug("mqlProperties.analyzedPropertyValue['qualifier']"); // for testing only
        debug(mqlProperties.analyzedPropertyValue['qualifier']); // for testing only
        switch (mqlProperties.analyzedPropertyValue['qualifier']) {
            case '/type/object':
                continue;
            case '':  /// MOST LIKELY THIS SHOULD ALSO BE USED IF 'UNDEFINED'
                
                debug("mqlProperties.parentSchemaType['properties']:"); // HAS THIS PROPERTY ALREADY BEEN DEFINED HERE????... IT HAS !
                debug(mqlProperties.parentSchemaType['properties']);
                
                // NOTE BELOW mqlProperties.type['properties'] DEPENDS ON IT BEING SET EARLIER ON IN preProcessProperties > forAnalyzeProperty > analyzeType > get_type_from_schema ... SO FIX IT THERE !!
                
                debug("Object.keys(mqlProperties.parent.properties)[i]:");
                debug(Object.keys(mqlProperties.parent.properties)[i]);
                
                // TEMP WORK AROUND TO AVOID SETTING schema_property TO type PROPERTIES
                if(Object.keys(mqlProperties.parent.properties)[i] === 'type'){
                  break;    
                }
                else {
                  var schema_property = mqlProperties.parentSchemaType['properties'][Object.keys(mqlProperties.parent.properties)[i]]; 
                }
                
                debug('schema_property:');
                debug(schema_property);

                debug("WOW ................ WE HAVE A SCHEMA PROPERTY " + JSON.stringify(schema_property) + " TO PROCESS !!!!!!!!!!: ");

                if (schema_property) {
                    mqlProperties.analyzedPropertyValue['qualifier'] = mqlProperties.typeName;
                    debug("mqlProperties.analyzedPropertyValue['qualifier']:");
                    debug(mqlProperties.analyzedPropertyValue['qualifier']);
                    mqlProperties.analyzedPropertyValue['schema'] = schema_property;
                    debug("mqlProperties.analyzedPropertyValue['schema']:");
                    debug(mqlProperties.analyzedPropertyValue['schema']);
                    if (typeof(schema_property['join_condition']) !== 'undefined') {
                        debug("schema_property['join_condition']:");
                        debug(schema_property['join_condition']);
                        mqlProperties.analyzedPropertyValue['types'] = [schema_property['type']];
                        debug("mqlProperties.analyzedPropertyValue['types']:");
                        debug(mqlProperties.analyzedPropertyValue['types']);
                        mqlProperties.propertyValue = mqlProperties.analyzedPropertyValue['value'];
                        debug("mqlProperties.propertyValue:");
                        debug(mqlProperties.propertyValue);
                        if (isObject(mqlProperties.propertyValue) || isArray(mqlProperties.propertyValue)) {
                            debug("WE ARE GOING TO forProcessMQL");
                            // AS WE ARE INSIDE A FOR LOOP WE NEED TO USE THE FOR-ENABLED FUNCTION forProcessMQL
//OLD                       forProcessMQL(mqlProperties, Object.keys(mqlProperties.analyzedProperty)[i], i); // call the for-enabled function to callback to processMQL
                            forProcessMQL(mqlProperties, Object.keys(mqlProperties.parent.properties)[i], i); // call the for-enabled function to callback to processMQL
                        }//eof isObject                        
                    }//eof if typeof
                }//eof if schema_property
                else {
                    var err = new Error('No property "' + mqlProperties.analyzedPropertyValue['name'] + '" in type "' + mqlProperties.typeName + '".');
                    mqlProperties.err = err;
                    debug('>>> leaving processProperties with error:'); // for testing only
                    //mqlProperties.callBackPreProcessProperties(err, mqlProperties);  // SHOULD THIS INSTEAD BE mqlProperties.callBackProcessProperties(err, mqlProperties); ???
                    debug(err.message);
                    mqlProperties.callBackProcessMQLObject(err, mqlProperties);
                }
                break;
            default:
                if (mqlProperties.analyzedPropertyValue['qualifier'] !== mqlProperties.analyzedProperty[0].typeName) {
                    var err = new Error('Property "' + mqlProperties.analyzedPropertyValue['qualifier'] + '/' + mqlProperties.analyzedPropertyValue['name']
                            + '" does not belong to the type "' + mqlProperties.typeName + '". This feature is not supported yet.');
                    mqlProperties.err = err;
                    debug('>>> leaving processProperties with error:'); // for testing only
                    //mqlProperties.callBackPreProcessProperties(err, mqlProperties);  // SHOULD THIS INSTEAD BE mqlProperties.callBackProcessProperties(err, mqlProperties); ???
                    debug(err.message);
                    mqlProperties.callBackProcessMQLObject(err, mqlProperties);
                }//eof default
        }//eof switch
        // WHAT DO WE DO AFTER HAVING CREATED ALL THE analyzedProperties ??... LOOSE THEM.. NO.. SO WE CREATED AN OBJECT BELOW CALLED mqlProperties.analyzedProperties:
        var analyzedProperty = {}; // This will be used to store the modified analyzedProperty
        analyzedProperty[mqlProperties.analyzedPropertyKey] = mqlProperties.analyzedPropertyValue;
        mqlProperties.analyzedProperties.push(analyzedProperty); 
        debug('processProperties: end of Round i=' + i); // for testing only
    }//eof for   
    debug('mqlProperties.analyzedProperties:'); // mqlProperties.analyzedProperties should now hold all analyzedProperties; 
    // NOTE: these properties and more are also stored in mqlProperties.mql_node, so it is recommended to use mqlProperties.mql_node instead
    debug(mqlProperties.analyzedProperties);
    debug('>>> leaving processProperties'); // for testing only
    mqlProperties.callBackProcessMQLObject(null, mqlProperties);
}//eof processProperties

// helper of processMQL
function processMQLObject(mqlProperties, cb) {
    debug('>>> inside processMQLObject'); // for testing only
    mqlProperties.callBackProcessMQL = cb;
    debug('mqlProperties.callBackProcessMQL:'); // for testing only
    debug(mqlProperties.callBackProcessMQL); // for testing only
    mqlProperties.mqlObject = mqlProperties.queryOrQueries[0];
    debug('mqlProperties.mqlObject:'); // for testing only
    debug(mqlProperties.mqlObject); // for testing only	
    // MQL properties can map to two things:
    //   - columns, in case the property type implies a value
    //   - foreign keys, which implement a relationship to a table
    mqlProperties.parent['properties'] = [];
    debug('mqlProperties.parent:'); // for testing only
    debug(mqlProperties.parent); // for testing only
    mqlProperties.types = [];
    debug('mqlProperties.types:'); // for testing only
    debug(mqlProperties.types); // for testing only	
    getParentType(mqlProperties, function(err, mqlProperties) {
        debug('>>> back inside processMQLObject from getParentType'); // for testing only
        if (err) {
            mqlProperties.err = err;
            debug('>>> leaving processMQLObject with error:'); // for testing only
            debug(err.message);
            mqlProperties.callBackProcessMQL(err, mqlProperties);
        }
        getObjectVars(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside processMQLObject from getObjectVars'); // for testing only
            if (err) {
                mqlProperties.err = err;
                debug('>>> leaving processMQLObject with error:'); // for testing only
                debug(err.message);
                mqlProperties.callBackProcessMQL(err, mqlProperties);
            }
            mqlProperties.starProperty = false;
            preProcessProperties(mqlProperties, function(err, mqlProperties) {
                debug('>>> back inside processMQLObject from preProcessProperties'); // for testing only
                if (err) {
                    mqlProperties.err = err;
                    debug('>>> leaving processMQLObject with error:'); // for testing only
                    debug(err.message);
                    mqlProperties.callBackProcessMQL(err, mqlProperties);
                }
                debug('§§§§§§§§§§§§§§§ WE DID: preProcessProperties ... '); // for testing only
                checkTypes(mqlProperties, function(err, mqlProperties) {
                    debug('>>> back inside processMQLObject from checkTypes'); // for testing only
                    if (err) {
                        mqlProperties.err = err;                        
                        debug('>>> leaving processMQLObject with error:'); // for testing only
                        debug(err.message);
                        mqlProperties.callBackProcessMQL(err, mqlProperties);
                    }
                    mqlProperties.typeName = [];
                    for (var i = 0; i < mqlProperties.types.length; i++) { //extract the type name
                        mqlProperties.typeName[i] = mqlProperties.types[i];
                    }
                    mqlProperties.parent['types'] = arrayKeys(mqlProperties.types);

                    if (mqlProperties.starProperty === true) {
                        //  expand_star(type['properties'], pre_processed_properties ); // TO DO: Make this work
                    }
                    debug('§§§§§§§§§§§§§§§ WE DID: checkTypes ... '); // for testing only				
                    processProperties(mqlProperties, function(err, mqlProperties) {
                        debug('>>> back inside processMQLObject from processProperties'); // for testing only
                        if (err) {
                            debug('>>> leaving processMQLObject with error');
                            mqlProperties.err = err;
                            mqlProperties.callBackProcessMQL(err, mqlProperties); // this is the right callback !!!
                        }
                        debug('mqlProperties.analyzedProperties:'); // mqlProperties.analyzedProperties should now hold all analyzed properties
                        debug(mqlProperties.analyzedProperties);
                        debug('>>> leaving processMQLObject');
                        debug('§§§§§§§§§§§§§§§ WE DID: processProperties ... '); // for testing only						
                        //return processed_properties; // TEMP
                        mqlProperties.callBackProcessMQL(null, mqlProperties); // this is the right callback !!!
                    });//eof processProperties
                });//eof checkTypes
            });//eof preProcessProperties
        });//eof getObjectVars
    });//eof getParentType
}//eof processMQLObject

//function processMQLArray(metaData, mql_array, parent, cb) {
function processMQLArray(mqlProperties, cb) {
    debug('>>> inside processMQLArray'); // for testing only
    mqlProperties.callBackProcessMQL = cb;
    debug('mqlProperties.callBackProcessMQL:'); // for testing only
    debug(mqlProperties.callBackProcessMQL); // for testing only
    mqlProperties.mqlArray = mqlProperties.queryOrQueries[0];
    debug('mqlProperties.mqlArray:'); // for testing only
    debug(mqlProperties.mqlArray); // for testing only
    var count = Object.keys(mqlProperties.mqlArray).length; // TO DO: DOES THIS WORK???.. YES IT SHOULD
    debug('count:'); // for testing only
    debug(count); // for testing only	
    switch (count) {
        case 0:
            break;
        case 1:
            mqlProperties.parent['entries'] = new Array();
            if (array_key_exists('schema', mqlProperties.parent)) {								// TO DO
                mqlProperties.parent['entries']['schema'] = mqlProperties.parent['schema'];
            }
            processMQL(mqlProperties.mqlArray[0], mqlProperties.parent['entries']); // TO DO
            break;
        default:
            debug('Expected a dictionary or a list with one element in a read (were you trying to write?)');
            var err = new Error('Expected a dictionary or a list with one element in a read (were you trying to write?)');
            mqlProperties.err = err;
            debug('>>> leaving processMQLArray with error:');
            debug(err.message);
            mqlProperties.callBackProcessMQL(err, mqlProperties);
    }
    if (mqlProperties.err) {
        debug('>>> leaving processMQLArray with error:');
        debug(err.message);
        mqlProperties.callBackProcessMQL(mqlProperties.err, mqlProperties); //TEMPORARY PLACEHOLDER TO FORCE CONTINUATION		
    }
    else {
        debug('>>> leaving processMQLArray');
        mqlProperties.callBackProcessMQL(null, mqlProperties); //TEMPORARY PLACEHOLDER TO FORCE CONTINUATION
    }
}//eof processMQLArray

// helper function of handleQuery
function processMQL(mqlProperties, cb) {
    debug('>>> inside processMQL'); // for testing only
    mqlProperties.callBackHandleQuery = cb;
    debug('mqlProperties.callBackHandleQuery:'); // for testing only
    debug(mqlProperties.callBackHandleQuery); // for testing only	

    if (mqlProperties.queryOrQueries[0] === null) {
        debug('mqlProperties.queryOrQueries[0] is null:'); // for testing only
        debug(mqlProperties.queryOrQueries[0]); // for testing only
        debug('>>> leaving processMQL with error'); // for testing only
        var err = new Error('mqlProperties.queryOrQueries[0] is null');
        mqlProperties.err = err;
        debug('>>> leaving processMQL with error:');
        debug(err.message);
        mqlProperties.callBackHandleQuery(err, mqlProperties);
    }
    else if (isObject(mqlProperties.queryOrQueries[0])) {
        debug('mqlProperties.queryOrQueries[0] is an object:'); // for testing only
        debug(mqlProperties.queryOrQueries[0]); // for testing only		
        processMQLObject(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside processMQL from processMQLObject');	// for testing only
            if(err){
                mqlProperties.err = err;
                debug('>>> leaving processMQL with error:');
                debug(err.message);
                mqlProperties.callBackHandleQuery(err, mqlProperties);
            }
            debug('§§§§§§§§§§§§§§§ WE DID: processMQL ... '); // for testing only
            debug('>>> leaving processMQL');	// for testing only  ///  WE ARE HERE !!!!!!!!!!
            mqlProperties.callBackHandleQuery(null, mqlProperties);  // <------------------------ THIS CALL BACK SEEMS TO JUMP TO THE WRONG SECTION INSIDE handleQuery !!!: FIX IT
        });
    }
    else if (isArray(mqlProperties.queryOrQueries[0])) {
        debug('mqlProperties.queryOrQueries[0] is an array:'); // for testing only
        debug(mqlProperties.queryOrQueries[0]); // for testing only	
        processMQLArray(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside processMQL from processMQLArray');	// for testing only
            if(err){
                mqlProperties.err = err;
                debug('>>> leaving processMQL with error:');
                debug(err.message);
                mqlProperties.callBackHandleQuery(err, mqlProperties);
            }
            debug('§§§§§§§§§§§§§§§ WE DID: processMQL ... '); // for testing only
            debug('>>> leaving processMQL');	// for testing only
            mqlProperties.callBackHandleQuery(null, mqlProperties);
        });
    }
    else {
        debug('mql query must be an object or an array, not "' + gettype(mqlProperties.queryOrQueries[0]) + '":'); // for testing only
        debug('>>> leaving processMQL with error'); // for testing only
        var err = new Error('mql query must be an object or an array, not "' + gettype(mqlProperties.queryOrQueries[0]) + '"');
        mqlProperties.err = err;
        debug('>>> leaving processMQL with error:');
        debug(err.message);
        mqlProperties.callBackHandleQuery(err, mqlProperties);
    }
}//eof processMQL
/*****************************************************************************
 *   SQL Generation Functions
 ******************************************************************************/
function resetIDs(mqlProperties) {
    debug('>>> inside resetIDs'); // for testing only    
    mqlProperties.tAliasID = 0;
    mqlProperties.cAliasID = 0;
    mqlProperties.pID = 0;
    debug('>>> leaving resetIDs'); // for testing only       
    return mqlProperties;
}//eof resetIDs

function getTAlias(mqlProperties) {
    debug('>>> inside getTAlias'); // for testing only
    mqlProperties.tAliasID = mqlProperties.tAliasID + 1;
    mqlProperties.tAlias = 't' + mqlProperties.tAliasID;
    debug('mqlProperties.tAlias:');
    debug(mqlProperties.tAlias);     
    debug('>>> leaving getTAlias'); // for testing only
    return mqlProperties;
}//eof getTAlias

function getCAlias(mqlProperties, isNew) {
    debug('>>> inside getCAlias'); // for testing only     
    if (typeof(isNew) === 'undefined') {
        isNew = true; // set default to true
    }
    if (isNew) {
        mqlProperties.cAliasID = mqlProperties.cAliasID + 1;
    }
    mqlProperties.cAlias = 'c' + mqlProperties.cAliasID;
    debug('mqlProperties.cAlias:');
    debug(mqlProperties.cAlias);    
    debug('>>> leaving getCAlias'); // for testing only    
    return mqlProperties;
}//eof getCAlias

function getPName(mqlProperties) {
    debug('>>> inside getPName'); // for testing only      
    mqlProperties.pID = mqlProperties.pID + 1;
    debug('mqlProperties.pID:');
    debug(mqlProperties.pID);
    mqlProperties.pName = 'p' + mqlProperties.pID;
    debug('mqlProperties.pName:');
    debug(mqlProperties.pName);
    debug('>>> leaving getPName'); // for testing only     
    return mqlProperties;
}//eof getPName

function isOptional(mqlProperties) {
    debug('>>> inside isOptional');
    mqlProperties.optional = false;
    if (mqlProperties.mql_node instanceof Array) {
        if (arrayKeyExists('properties', mqlProperties.mql_node)) {
            mqlProperties.properties = mqlProperties.mql_node['properties'];
            if(Object.keys(mqlProperties.properties).length === 0){    
                mqlProperties.optional = true;
            }//eof if
            else if (typeof(mqlProperties.properties['optional']) !== 'undefined') {
                mqlProperties.optional_property = mqlProperties.properties['optional'];
                mqlProperties.value = mqlProperties.optional_property['value'];
                switch (mqlProperties.value) {
                    case true:
                        break;
                    case 'optional':
                        mqlProperties.optional = true;
                        break;
                }//eof switch
            }//eof else if            
        }//eof if
        else if (arrayKeyExists('entries', mqlProperties.mql_node)) {
            mqlProperties.entries = mqlProperties.mql_node['entries'];
            if (Object.keys(mqlProperties.entries).length === null) {
                mqlProperties.optional = true;
            }
        }//eof else if
        else if (arrayKeyExists('value', mqlProperties.mql_node)) {
            mqlProperties.value = mqlProperties.mql_node['value'];
            if (mqlProperties.value === null) {
                mqlProperties.optional = true;
            }//eof if            
        }//eof else if
    }//eof if
    else {
        debug("type is " + getType(mqlProperties)); // TO DO... make this work
    }//eof else
    debug('mqlProperties.optional:');
    debug(mqlProperties.optional);
    debug('>>> leaving isOptional');
    return mqlProperties.optional;

// REPLACES
//    $optional = FALSE;
//    if (is_array($mql_node)) {
//        if (array_key_exists('properties', $mql_node)){
//            $properties = $mql_node['properties'];
//            if (count($properties)===0){
//                $optional = TRUE;
//            }
//            else 
//            if (isset($properties['optional'])) {
//                $optional_property = $properties['optional'];
//                $value = $optional_property['value'];
//                switch ($value) {
//                    case TRUE:
//                    case 'optional':
//                        $optional = TRUE;
//                }
//            }
//        }
//        else 
//        if (array_key_exists('entries', $mql_node)){
//            $entries = $mql_node['entries'];
//            if (count($entries)===NULL){
//                $optional = TRUE;
//            }
//        }
//        else 
//        if (array_key_exists('value', $mql_node)) {
//            $value = $mql_node['value'];
//            if ($value===NULL) {  
//                $optional = TRUE;
//            }
//        }
//    }
//    else {
//        print_r("\ntype is ".gettype($mql_node)."\n");
//    }
//    return $optional; 

}

function arrayUnshift(mqlProperties, array) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Martijn Wieringa
    // +   improved by: jmweb
    // %        note 1: Currently does not handle objects
    // *     example 1: array_unshift(['van', 'Zonneveld'], 'Kevin');
    // *     returns 1: 3
    debug('>>> inside arrayUnshift'); // for testing only 
    var i = array.length;

    while (--i !== 0) {
        array[0].unshift(array[i]);
    }
    debug('>>> leaving arrayUnshift'); // for testing only     
    return mqlProperties;
}

function arrayKeyExists(key, search) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Felix Geisendoerfer (http://www.debuggable.com/felix)
    // *     example 1: array_key_exists('kevin', {'kevin': 'van Zonneveld'});
    // *     returns 1: true
    // input sanitation
    debug('>>> inside arrayKeyExists'); // for testing only     
    if (!search || (search.constructor !== Array && search.constructor !== Object)) {
        return false;
    }
    debug('>>> leaving arrayKeyExists'); // for testing only     
    return key in search;
}

function getFromClause(mqlProperties) {
    debug('>>> inside getFromClause'); // for testing only     
    if (typeof(mqlProperties.mql_node['schema']) === 'undefined') {
        mqlProperties.schema = null;
    }
    else {
        mqlProperties.schema = mqlProperties.mql_node['schema'];
    }
    debug('mqlProperties.schema:');
    debug(mqlProperties.schema);

    mqlProperties.from = mqlProperties.query[0].from;
    //REPLACES  $from = &$query['from'];
    debug('mqlProperties.from:');
    debug(mqlProperties.from);

    mqlProperties.count_from = Object.keys(mqlProperties.from).length;
    //REPLACES $count_from = count($from);
    debug('mqlProperties.count_from:');
    debug(mqlProperties.count_from);

    mqlProperties.from_line = [];
    //REPLACES $from_line = array();
    debug('mqlProperties.from_line:');
    debug(mqlProperties.from_line);

    mqlProperties.join_condition = '';
    //REPLACES $join_condition = '';
    debug('mqlProperties.join_condition:');
    debug(mqlProperties.join_condition);

    if (typeof(mqlProperties.schema['direction']) !== 'undefined') {
        mqlProperties.direction = mqlProperties.schema['direction'];

        if ((mqlProperties.is_optional === isOptional(mqlProperties)) === true) {
            mqlProperties.mql_node['outer_join'] = true;
            mqlProperties.outer_join = true;
        }
        else if (typeof(mqlProperties.mql_node['outer_join']) !== 'undefined') {
            mqlProperties.outer_join = mqlProperties.mql_node['outer_join'];
        }
        else {
            mqlProperties.outer_join = false;
        }
        debug('mqlProperties.outer_join:');
        debug(mqlProperties.outer_join);

        if (mqlProperties.outer_join) {
            mqlProperties.from_line['join_type'] = 'LEFT';
        }
        else {
            mqlProperties.from_line['join_type'] = 'INNER';
        }
        debug("mqlProperties.from_line['join_type']:");
        debug(mqlProperties.from_line['join_type']);

        switch (mqlProperties.direction)
        {
            case 'referencing->referenced': //lookup (n:1 relationship) 
                break;
            case 'referenced<-referencing': //lookdown (1:n relationship) - starts a separate query.
                mqlProperties.select = mqlProperties.query['select'];
                mqlProperties.order_by = mqlProperties.query['order_by'];
                mqlProperties.merge_into = mqlProperties.query['merge_into'];
                mqlProperties.merge_into_columns = mqlProperties.merge_into['columns'];
                break;
        }
        // REPLACES
        //  switch ($direction) {
        //      case 'referencing->referenced':     //lookup (n:1 relationship)           
        //          break;
        //      case 'referenced<-referencing':     //lookdown (1:n relationship) - starts a separate query.
        //          $select = &$query['select'];
        //          $order_by = &$query['order_by'];
        //          $merge_into = &$query['merge_into'];
        //          $merge_into_columns = &$merge_into['columns'];
        //          break;
        //  }        
        for (var i = 0; i < mqlProperties.columns.length; i++) {
            //var arrayItem = mqlProperties.columns[i];
            if (mqlProperties.join_condition === '') {
                mqlProperties.join_condition = mqlProperties.join_condition + 'ON';
            }
            else {
                mqlProperties.join_condition = mqlProperties.join_condition + "\n" +'AND';  // USES " TO ASSURE THE ESCAPE 
            }
            ;

            switch (mqlProperties.direction)
            {
                case 'referencing->referenced': //lookup (n:1 relationship) 
                    mqlProperties.referenced_column = mqlProperties.tAlias + '.' + mqlProperties.columns[i]['referenced_column'];
                    debug('mqlProperties.referenced_column:');
                    debug(mqlProperties.referenced_column);
                    // REPLACES  $referenced_column = $tAlias.'.'.$columns['referenced_column'];                  
                    if (mqlProperties.outer_join === true && mqlProperties.join_condition === 'ON') {
                        if (mqlProperties.optional === true) {
                            mqlProperties.from_line['optionality_group'] = mqlProperties.tAlias;
                        }//eof if
                        else {
                            if (mqlProperties.count_from) {
                                mqlProperties.from_line['optionality_group'] = mqlProperties.from[mqlProperties.child_tAlias]['optionality_group'];
                            }//eof if
                            else {
                                mqlProperties.from_line['optionality_group'] = mqlProperties.child_tAlias;
                            }//eof else

                        }//eof else
                        mqlProperties.from_line['optionality_group_column'] = mqlProperties.referenced_column;
                        debug('mqlProperties.from_line:');
                        debug(mqlProperties.from_line);
                        // REPLACES
                        //   if ($optional===TRUE) {
                        //       $from_line['optionality_group'] = $tAlias;
                        //   }
                        //   else {
                        //       if ($count_from) {                        
                        //           $from_line['optionality_group'] = $from[$child_tAlias]['optionality_group'];
                        //       }
                        //       else {
                        //           $from_line['optionality_group'] = $child_tAlias;
                        //       }
                        //   }
                        //   $from_line['optionality_group_column'] = $referenced_column;                
                    }//eof if
                    mqlProperties.join_condition = mqlProperties.join_condition
                            + ' '
                            + mqlProperties.child_tAlias
                            + '.'
                            + mqlProperties.columns[i]['referencing_column']
                            + ' = '
                            + mqlProperties.referenced_column;
                    debug('mqlProperties.join_condition:');
                    debug(mqlProperties.join_condition);
                    //REPLACES  $join_condition .= ' '  .$child_tAlias.'.'.$columns['referencing_column']
                    //                  .  ' = '.$referenced_column;                    
                    break;
                case 'referenced<-referencing': //lookdown (1:n relationship) - starts a separate query.
                    mqlProperties.column_ref = mqlProperties.tAlias + '.' + mqlProperties.columns[i]['referencing_column'];
                    debug('mqlProperties.column_ref:');
                    debug(mqlProperties.column_ref);
                    //REPLACES  $column_ref = $tAlias.'.'.$columns['referencing_column'];

                    mqlProperties = getCAlias(mqlProperties);
                    mqlProperties.alias = mqlProperties.tAlias + mqlProperties.cAlias;
                    debug('mqlProperties.alias:');
                    debug(mqlProperties.alias);
                    //REPLACES     $alias = $tAlias.get_cAlias();

                    mqlProperties.merge_into_columns = [];
                    mqlProperties.merge_into_columns[0] = mqlProperties.alias;
                    debug('mqlProperties.merge_into_columns:');
                    debug(mqlProperties.merge_into_columns);
                    //REPLACES  $merge_into_columns[] = $alias;

                    mqlProperties.select[mqlProperties.column_ref] = mqlProperties.alias;
                    debug('mqlProperties.select[mqlProperties.column_ref]:');
                    debug(mqlProperties.select[mqlProperties.column_ref]);
                    //REPLACES  $select[$column_ref] = $alias;

                    if (mqlProperties.order_by === '') {
                        mqlProperties.order_by = mqlProperties.order_by + 'ORDER BY';
                    }
                    else {
                        mqlProperties.order_by = mqlProperties.order_by + "\n" + ', ';  // USES " TO ASSURE THE ESCAPE
                    }
                    mqlProperties.order_by = mqlProperties.order_by + mqlProperties.alias;
                    debug('mqlProperties.order_by:');
                    debug(mqlProperties.order_by);
                    //REPLACES $order_by .= ($order_by===''? 'ORDER BY ' : "\n, ");
                    //         $order_by .= $alias;
                    break;
            }//eof switch
        }//eof for
    }//eof if
    if (typeof(mqlProperties.schema_name) !== 'undefined') {
        mqlProperties.from_line['table'] = mqlProperties.schema_name + '.' + mqlProperties.table_name;
    }
    else {
        mqlProperties.from_line['table'] = '' + mqlProperties.table_name;
    }
    debug('mqlProperties.from_line:');
    debug(mqlProperties.from_line);
    // REPLACES $from_line['table'] = ($schema_name? $schema_name.'.' : '').$table_name;

    mqlProperties.from_line['alias'] = mqlProperties.tAlias;
    debug("mqlProperties.from_line['alias']:");
    debug(mqlProperties.from_line['alias']);
    // REPLACES  $from_line['alias'] = $tAlias;

    if (mqlProperties.join_condition) {
        mqlProperties.from_line['join_condition'] = mqlProperties.join_condition;
    }
    debug("mqlProperties.from_line['join_condition']:");
    debug(mqlProperties.from_line['join_condition']);
    //REPLACES  
    // if ($join_condition) {
    //   $from_line['join_condition'] = $join_condition;
    // }

    mqlProperties.from[mqlProperties.tAlias] = mqlProperties.from_line;
    debug("mqlProperties.from[mqlProperties.tAlias]:");
    debug(mqlProperties.from[mqlProperties.tAlias]);
    //REPLACES $from[$tAlias] = $from_line;      
    debug('>>> leaving getFromClause'); // for testing only  
    return mqlProperties;
}// eof getFromClause


//helper for addParameterForProperty
function mapMQLTypeToJavaScriptType(mqlProperties){
    debug('>>> inside mapMQLTypeToJavaScriptType'); // for testing only    
    debug('mqlProperties.mql_type:');
    debug(mqlProperties.mql_type);  
    
    switch(mqlProperties.mql_type){
        case '/type/boolean':
            mqlProperties.javascript_type = Boolean;
            break;
        case '/type/content':
            mqlProperties.javascript_type = String; // // There's no LOB in JavaScript, use String instead.
            break;
        case '/type/datetime':
        case '/type/text': 
        case '/type/float': //this feels so wrong, but PDO doesn't seem t support any decimal/float type :(
            mqlProperties.javascript_type = Number; // There's no Float in JavaScript, just Number.
            break;
        case '/type/int':
            mqlProperties.javascript_type = Number; // There's no Integer in JavaScript, just Number.
            break;            
        case '/type/rawstring':
            mqlProperties.javascript_type = String;
            break;            
    }//eof switch

// REPLACES
//    switch ($mql_type){
//        case '/type/boolean':
//            $pdo_type = PDO::PARAM_BOOL;
//            break;
//        case '/type/content':
//            $pdo_type = PDO::PARAM_LOB;
//            break;
//        case '/type/datetime':
//        case '/type/text':
//        case '/type/float': //this feels so wrong, but PDO doesn't seem t support any decimal/float type :(
//            $pdo_type = PDO::PARAM_STR;
//            break;
//        case '/type/int':
//            $pdo_type = PDO::PARAM_INT;
//            break;
//        case '/type/rawstring':
//            $pdo_type = PDO::PARAM_STR;
//            break;
//    }
//    return $pdo_type;
    debug('mqlProperties.javascript_type:');
    debug(mqlProperties.javascript_type);
    debug('>>> leaving mapMQLTypeToJavaScriptType'); // for testing only
    return mqlProperties;
}//eof mapMQLTypeToJavaScriptType


//helper for handleFilterProperty & handleNonFilterProperty
function addParameter(mqlProperties){
    debug('>>> inside addParameter');
    debug('mqlProperties.value_for_parameter_to_add:');
    debug(mqlProperties.value_for_parameter_to_add);
    
    debug('mqlProperties.query:');
    debug(mqlProperties.query);  
    
    mqlProperties = getPName(mqlProperties);
    mqlProperties.param_name = mqlProperties.pName;// TO DO implement this function
    debug('mqlProperties.param_name:');
    debug(mqlProperties.param_name);
    
    mqlProperties.query[0].where += ':' + mqlProperties.param_name;
    mqlProperties.params = new Array({  // WHAT WILL WE DO WITH mqlProperties.params ??? IS IT GOING TO BE ATTACHED TO A QUERY SOME WHERE
            'name'  : mqlProperties.param_name,
            'value' : mqlProperties.value_for_parameter_to_add,
            'type'  : mqlProperties.javascript_type
    });
    debug('mqlProperties.params:');
    debug(mqlProperties.params);
    
    // JUST FOR THE PURPOSE OF HAVING PARAMS AT QUERY LEVEL
    // WE HERE ADD THE CONTENT OF THE PARAMS ARRAY TO THE QUERY PARAMS ARRAY
    // NOTE: THIS IS NOT IN THE ORIGINAL CODE
    
    mqlProperties.query[0].params.push(mqlProperties.params[0]); 
    debug('mqlProperties.query[0].params:');
    debug(mqlProperties.query[0].params);
    
// REPLACES
//function add_parameter(&$where, &$params, $value, $pdo_type){
//    $where .= ':'.($param_name = get_p_name());
//    $params[] = array(
//        'name'  =>  $param_name
//    ,   'value' =>  $value
//    ,   'type'  =>  $pdo_type
//    );
//}
    debug('>>> leaving addParameter');
    return mqlProperties;
}//eof addParameter


// helper for handleFilterProperty
function addParameterForProperty(mqlProperties){
    debug('>>> inside addParameterForProperty');
    debug('mqlProperties.property_for_parameter_to_add:');
    debug(mqlProperties.property_for_parameter_to_add);
    
    mqlProperties.mql_type = mqlProperties.property_for_parameter_to_add['schema']['type'];
    debug('mqlProperties.mql_type:');
    debug(mqlProperties.mql_type); 
    
    mqlProperties = mapMQLTypeToJavaScriptType(mqlProperties);
    debug('mqlProperties.javascript_type:');
    debug(mqlProperties.javascript_type);
    
    if(mqlProperties.property_for_parameter_to_add[0]['value'] instanceof Array){
        for(i=0; i< Object.keys(mqlProperties.property_for_parameter_to_add[0]['value']).length; i++){
           if(i){
               
           }//eof if  
           mqlProperties.value_for_parameter_to_add = mqlProperties.property_for_parameter_to_add[0]['value'][i];
           debug('mqlProperties.value_for_parameter_to_add:');
           debug(mqlProperties.value_for_parameter_to_add);
           mqlProperties = addParameter(mqlProperties);
        }//eof for
    }//eof if
    else{
           mqlProperties.value_for_parameter_to_add = mqlProperties.property_for_parameter_to_add[0]['value'];
           debug('mqlProperties.value_for_parameter_to_add:');
           debug(mqlProperties.value_for_parameter_to_add);
           mqlProperties = addParameter(mqlProperties);       
    }//eof else
    
// REPLACES
//function add_parameter_for_property(&$where, &$params, $property){
//    $property_value = $property['value'];
//    $mql_type = $property['schema']['type'];
//    $pdo_type = map_mql_to_pdo_type($mql_type);
//    if (is_array($property_value)) {
//        $num_entries = count($property_value);
//        for ($i=0; $i<$num_entries; $i++) {
//            if ($i){
//                $where .= ', ';
//            }
//            add_parameter($where, $params, $property_value[$i], $pdo_type);
//        }
//    }
//    else {
//        add_parameter($where, $params, $property_value, $pdo_type);
//    }
//}
    debug('>>> leaving addParameterForProperty');
    return mqlProperties;
}//eof addParameterForProperty

// helper for generateSQL
function handleFilterProperty(mqlProperties){
    debug('>>> inside handleFilterProperty');
    debug('mqlProperties.query_index:');
    debug(mqlProperties.query_index);  // RETURNS UNDEFINED
    
    debug("mqlProperties.queries[mqlProperties.query_index]:");
    debug(mqlProperties.queries[mqlProperties.query_index]);  // RETURNS UNDEFINED
    
    debug('mqlProperties.query:');  // WE WILL HAVE TO RESORT TO THIS mqlProperties.query AS THE mqlProperties.query_index IS UNDEFINED
    debug(mqlProperties.query);
    
    debug('mqlProperties.filter_property_key:');
    debug(mqlProperties.filter_property_key);
    
    debug('mqlProperties.filter_property_value:');
    debug(mqlProperties.filter_property_value);
    
    debug("Object.keys(mqlProperties.query[0].from):");
    debug(Object.keys(mqlProperties.query[0].from));

    if(Object.keys(mqlProperties.query[0].from).length > 1){ 
        // WE ARE DEALING WITH MORE THAN ONE TABLE
        mqlProperties.from_line = mqlProperties.query[0].from[Object.keys(mqlProperties.query[0].from).length -1];
        
        debug('-----------------------------------------FROM LINE-----------------------------------------');
        debug('mqlProperties.from_line:');
        debug(mqlProperties.from_line);
        debug('-------------------------------------------------------------------------------------------');
        
        mqlProperties.from_or_where = mqlProperties.from_line['join_condition'];
        mqlProperties.from_or_where += "\n"+'AND'+' '+Object.keys(mqlProperties.query[0].from)[Object.keys(mqlProperties.query[0].from).length -1]+'.'+mqlProperties.column_name;// USES " TO ASSURE THE ESCAPE
        debug('mqlProperties.from_or_where:');
        debug(mqlProperties.from_or_where);
    }//eof if
    else{
        // WE ARE DEALING WITH ONE TABLE ONLY
        
        debug('-----------------------------------------FROM LINE-----------------------------------------');
        debug('mqlProperties.from_line:');
        debug(mqlProperties.from_line);
        debug('-------------------------------------------------------------------------------------------');        
        
        mqlProperties.from_or_where = mqlProperties.query[0].where;
        debug('mqlProperties.from_or_where:');
        debug(mqlProperties.from_or_where);
        if(mqlProperties.from_or_where.length >0){
            mqlProperties.from_or_where += "\n"+'AND'+' '+Object.keys(mqlProperties.query[0].from)[0]+'.'+mqlProperties.column_name;// USES " TO ASSURE THE ESCAPE
        }//eof if
        else{
            mqlProperties.from_or_where += 'WHERE'+' '+Object.keys(mqlProperties.query[0].from)[0]+'.'+mqlProperties.column_name;
        }//eof else
        debug('mqlProperties.from_or_where:');
        debug(mqlProperties.from_or_where);
    }//eof else
    //prepare right hand side of the filter expression
    mqlProperties.add_closing_parenthesis = false;
    debug('mqlProperties.add_closing_parenthesis:');
    debug(mqlProperties.add_closing_parenthesis);    
    mqlProperties.add_closing_escape_clause = false;
    debug('mqlProperties.add_closing_escape_clause:');
    debug(mqlProperties.add_closing_escape_clause);     
    
    if(mqlProperties.operator === mqlProperties.filter_property_value[0].operator){
        //If an operator is specified, 
        //the expression is used in the WHERE clause.
        switch(mqlProperties.operator){
            case '~=':  //funky mql pattern matcher
                //not implemented yet. 
                //most likely it will be very hard 
                //to implement this in a rdmbs-independent way
                //let alone efficiency
                break;
            case '<': 
            case '>': 
            case '<=': 
            case '>=': 
            case '!=':
            case '=':  //note that = is an extension. Silly it's not standard.
                mqlProperties.from_or_where += ' '+mqlProperties.operator+' ';
                break;
            case '!|=':
                mqlProperties.from_or_where += ' NOT';
                //fall through is intentional, keep the !|= and |= together please, in order.                
            case '|=':
                mqlProperties.from_or_where += ' IN (';
                mqlProperties.add_closing_parenthesis = true;         
                break;      
            case '!?=': //extension. Ordinary database NOT LIKE
                mqlProperties.from_or_where += ' NOT';
                //fall through is intentional, keep the !?= and ?= together please, in order.
            case '?=':  //extension. Ordinary database LIKE
                mqlProperties.from_or_where += ' LIKE ';
                mqlProperties.add_closing_escape_clause = true;
                break;
        }//eof switch
    }//eof if
    else {
        //If no operator is specified, 
        //the comparison is automatically with equals.
        mqlProperties.from_or_where += ' = ';
    }//eof else
    //
      
    // WE ATTEMPT TO SET THE from_or_where TO query[0].where
    // NOTE: THIS IS NOT IN THE ORIGINAL CODE
    mqlProperties.query[0].where = mqlProperties.from_or_where; // WORKS!!
        
    //prepare the right hand side of the comparison expression
    mqlProperties.property_for_parameter_to_add = mqlProperties.filter_property_value;
    debug('mqlProperties.property_for_parameter_to_add:');
    debug(mqlProperties.property_for_parameter_to_add);
    mqlProperties = addParameterForProperty(mqlProperties);
    if (mqlProperties.add_closing_parenthesis) {
        mqlProperties.from_or_where += ')';
    }//eof if
    else if (mqlProperties.add_closing_escape_clause) {
        mqlProperties.from_or_where += " ESCAPE '\\'";
    }//eof else   
    
    // SURELY WE HAVE TO ADD THE NEWLY MODIFIED from_or_where ARRAY
    // TO THE mqlProperties.query[0].where
    // NOTE: THIS IS NOT IN THE ORIGINAL CODE: THEREFOR WE HAVE COMMENTED IT OUT
//    mqlProperties.query[0].where = mqlProperties.from_or_where;
//    debug('mqlProperties.query[0].where:');
//    debug(mqlProperties.query[0].where);    
    
    debug('---------------------------------------FROM OR WHERE---------------------------------------');
    debug('mqlProperties.from_or_where:');
    debug(mqlProperties.from_or_where);
    debug('-------------------------------------------------------------------------------------------');
    
    debug('>>> leaving handleFilterProperty');
    return mqlProperties;
}//eof handleFilterProperty


//helper for generateSQL
function handleNonFilterProperty(mqlProperties){
    debug('>>> inside handleNonFilterProperty ++++++++++++++++++++++DID WE GET IN HERE.. PLEASE+++++++++++++');
    debug('mqlProperties.query_index:');
    debug(mqlProperties.query_index);  // RETURNS UNDEFINED
    
    debug("mqlProperties.queries[mqlProperties.query_index]:");
    debug(mqlProperties.queries[mqlProperties.query_index]);  // RETURNS UNDEFINED
    
    debug('mqlProperties.query:');  // WE WILL HAVE TO RESORT TO THIS mqlProperties.query AS THE mqlProperties.query_index IS UNDEFINED
    debug(mqlProperties.query);
    
    debug('mqlProperties.non_filter_property_key:');
    debug(mqlProperties.non_filter_property_key);
    
    debug('mqlProperties.non_filter_property_value:');
    debug(mqlProperties.non_filter_property_value);    
    
    mqlProperties = getCAlias(mqlProperties);
    debug('mqlProperties.cAlias:');
    debug(mqlProperties.cAlias);    

    debug('mqlProperties.tAlias:');
    debug(mqlProperties.tAlias);
    
    mqlProperties.cAlias = mqlProperties.tAlias + mqlProperties.cAlias;
    debug('mqlProperties.cAlias:');
    debug(mqlProperties.cAlias);     
    
    mqlProperties.column_ref = mqlProperties.tAlias +'.'+ mqlProperties.column_name;
    debug('mqlProperties.column_ref:');
    debug(mqlProperties.column_ref); 

    mqlProperties.query[0].select[mqlProperties.column_ref] = mqlProperties.cAlias;
    debug('mqlProperties.query[0].select[mqlProperties.column_ref]:');
    debug(mqlProperties.query[0].select[mqlProperties.column_ref]); 
    
    mqlProperties.non_filter_property_value['alias'] = mqlProperties.cAlias;
    debug("mqlProperties.non_filter_property_value['alias']:");
    debug(mqlProperties.non_filter_property_value['alias']);
    
// REPLACES
//function handle_non_filter_property($t_alias, $column_name, &$select, &$property){
//    $c_alias = $t_alias.get_c_alias();
//    $column_ref = $t_alias.'.'.$column_name;
//    $select[$column_ref] = $c_alias;
//    $property['alias'] = $c_alias;
//}

    debug('>>> leaving handleNonFilterProperty');
    return mqlProperties;
}//eof handleNonFilterProperty



//function generateSQL(metaData, mql_node, queries, query_index, child_tAlias, merge_into) { // child_tAlias and merge_into are optional

//helper for HandleQuery	
function generateSQL(mqlProperties, cb) {
    debug('>>> inside generateSQL'); // for testing only
    mqlProperties.callBackHandleQuery = cb; // THIS IS CORRECT!!
    mqlProperties.childTAlias = typeof mqlProperties.childTAlias !== 'undefined' ? mqlProperties.childTAlias : null;
    debug('mqlProperties.childTAlias:'); // for testing only
    debug(mqlProperties.childTAlias); // for testing only	
    mqlProperties.mergeInto = typeof mqlProperties.mergeInto !== 'undefined' ? mqlProperties.mergeInto : null;
    debug('mqlProperties.mergeInto:'); // for testing only
    debug(mqlProperties.mergeInto); // for testing only
    debug("mqlProperties.parent['entries']:"); // for testing only
    debug(mqlProperties.parent['entries']); // for testing only

    // NOTE: $mql_node = mqlProperties.parent
    if (typeof(mqlProperties.parent['entries']) !== 'undefined') {
        //generateSQL(mqlProperties.parent['entries'], $queries, $query_index, mqlProperties.childTAlias, mqlProperties.mergeInto);
        generateSQL(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside generateSQL from generateSQL (itself!)'); // for testing only			

            // TO DO			

            debug('>>> leaving generateSQL');
            mqlProperties.callBackHandleQuery(null, mqlProperties);
        });//eof generateSQL... a call to itself!
    }//eof if

    if (typeof(mqlProperties.parent['query_index']) === 'undefined') {
        mqlProperties.parent['query_index'] = mqlProperties.queryKey;//WAS $query_index TEMPORARY SET TO mqlProperties.queryKey
        debug("mqlProperties.parent['query_index']:"); // for testing only
        debug(mqlProperties.parent['query_index']); // for testing only
    }

    if (typeof(mqlProperties.queries) !== 'undefined' && mqlProperties.queries !== null) {
        debug('mqlProperties.queries:');
        debug(mqlProperties.queries);
        if (typeof(mqlProperties.queries[mqlProperties.queryKey]) !== 'undefined') {
            mqlProperties.query = mqlProperties.queries[mqlProperties.queryKey];
            debug('mqlProperties.query:');
            debug(mqlProperties.query);
        }//eof if 
        else {
            mqlProperties.query = null;
            debug('mqlProperties.query:');
            debug(mqlProperties.query);
        }//eof else

    }//eof if 
    else {
        mqlProperties.queries = [];
        mqlProperties.query = null;
        debug('mqlProperties.query:');
        debug(mqlProperties.query);
    }//eof else
    debug('mqlProperties.query:'); // for testing only
    debug(mqlProperties.query); // for testing only

    if (!mqlProperties.query) {
        mqlProperties.query = new Array({
            'select': [],
            'from': [],
            'where': '',
            'order_by': '',
            'limit': '',
            'params': [],
            'mql_node': mqlProperties.parent,
            'indexes': [],
            'merge_into': mqlProperties.mergeInto,
            'results': []
        });
        mqlProperties.queries[mqlProperties.queryKey] = mqlProperties.query[0];
        debug('mqlProperties.queries[mqlProperties.queryKey]:'); // for testing only
        debug(mqlProperties.queries[mqlProperties.queryKey]); // for testing only      
    }

    mqlProperties.select = mqlProperties.query[0]['select'];  // IN THE ORIGINAL CODE THIS IS A 'passing-by-reference'
    debug('mqlProperties.select:'); // for testing only       // BEFORE LAEVING THE FUNCTION
    debug(mqlProperties.select); // for testing only          // MAKE SURE TO REASSIGN BACK TO THE query
    mqlProperties.from = mqlProperties.query[0]['from'];
    debug('mqlProperties.from:'); // for testing only
    debug(mqlProperties.from); // for testing only
    mqlProperties.where = mqlProperties.query[0]['where'];
    debug('mqlProperties.where:'); // for testing only
    debug(mqlProperties.where); // for testing only
    mqlProperties.params = mqlProperties.query[0]['params'];
    debug('mqlProperties.params:'); // for testing only
    debug(mqlProperties.params); // for testing only
    mqlProperties.mql_node = mqlProperties.query[0]['mql_node'];
    debug('mqlProperties.mql_nodes:'); // for testing only
    debug(mqlProperties.mql_node); // for testing only  
    mqlProperties.indexes = mqlProperties.query[0]['indexes'];
    debug('mqlProperties.indexes:'); // for testing only
    debug(mqlProperties.indexes); // for testing only
    debug("mqlProperties.mql_node['types'][0]:");
    debug(mqlProperties.mql_node['types'][0]);
    
    // PURELY AS A TEST, WE ASSIGN mqlProperties.types.key TO mqlProperties.mql_node['types']
    // THIS IS NOT PART OF THE ORIGINAL CODE
    // HOWEVER, WITHOUT A TYPE WE DO NOT SEEM TO ARRIVE AT A VALID SQL STATEMENT
    debug('Object.keys(mqlProperties.types):');
    debug(Object.keys(mqlProperties.types[0]));
    mqlProperties.mql_node['types'] = Object.keys(mqlProperties.types[0]);
    debug("mqlProperties.mql_node['types'][0]:");
    debug(mqlProperties.mql_node['types'][0]);    
    //
    //
    mqlProperties.type = mqlProperties.mql_node['types'][0];
    debug('mqlProperties.type:'); // for testing only
    debug(mqlProperties.type); // for testing only   

    mqlProperties = analyzeType(mqlProperties);

    debug('mqlProperties.type:'); // for testing only
    debug(mqlProperties.type); // for testing only

    mqlProperties.domain_name = mqlProperties.type[0]['domain'];
    debug('mqlProperties.domain_name:'); // for testing only
    debug(mqlProperties.domain_name); // for testing only
    //REPLACES $domain_name = $type['domain'];

    debug('mqlProperties.metaData:'); // for testing only
    debug(mqlProperties.metaData); // for testing only

    mqlProperties.domains = mqlProperties.metaData['domains'];
    debug('mqlProperties.domains:'); // for testing only
    debug(mqlProperties.domains); // for testing only
    //REPLACES $domains = $metaData['domains'];

    mqlProperties.schema_domain = mqlProperties.domains[mqlProperties.domain_name];
    debug('mqlProperties.schema_domain:'); // for testing only
    debug(mqlProperties.schema_domain); // for testing only
    //REPLACES $schema_domain = $domains[$domain_name];

    mqlProperties.type_name = mqlProperties.type[0]['type'];
    debug('mqlProperties.type_name:'); // for testing only
    debug(mqlProperties.type_name); // for testing only    
    //REPLACES $type_name = $type['type'];

    mqlProperties.schema_type = mqlProperties.schema_domain['types'][mqlProperties.type_name];
    debug('mqlProperties.schema_type:'); // for testing only
    debug(mqlProperties.schema_type); // for testing only     
    //REPLACES $schema_type = $schema_domain['types'][$type_name];

    //table_name is either explicitly specified, or we take the type name
    if (typeof(mqlProperties.schema_type['table_name']) === 'undefined') {
        mqlProperties.table_name = mqlProperties.type_name;
    }
    else {
        mqlProperties.table_name = mqlProperties.schema_type['table_name'];
    }
    debug('mqlProperties.table_name:'); // for testing only
    debug(mqlProperties.table_name); // for testing only   
    //     
    //schema_name is either explicitly specified, or we take the domain name
    if (typeof(mqlProperties.schema_type['schema_name']) === 'undefined') {
        if (typeof(mqlProperties.schema_domain['schema_name']) === 'undefined') {
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
    debug('mqlProperties.schema_name:'); // for testing only
    debug(mqlProperties.schema_name); // for testing only        

    mqlProperties = getTAlias(mqlProperties);
    debug('mqlProperties.tAlias:'); // for testing only
    debug(mqlProperties.tAlias); // for testing only  
    //REPLACES $tAlias = get_tAlias();

    mqlProperties = getFromClause(mqlProperties);
    debug('mqlProperties.from:'); // for testing only
    debug(mqlProperties.from); // for testing only  
    //REPLACES get_from_clause($mql_node, $tAlias, $child_tAlias, $schema_name, $table_name, $query);

    if (arrayKeyExists('properties', mqlProperties.mql_node)) {

        mqlProperties.properties = mqlProperties.mql_node['properties'];
        debug('mqlProperties.properties:');
        debug(mqlProperties.properties);
        //REPLACES $properties = &$mql_node['properties'];

        debug('Object.keys(mqlProperties.properties).length:');
        debug(Object.keys(mqlProperties.properties).length);

        for (i = 0; i < Object.keys(mqlProperties.properties).length; i++) {
            debug('Start of Round i: '+i);
            debug('Object.keys(mqlProperties.properties)[i]:');
            debug(Object.keys(mqlProperties.properties)[i]);
            // THIS IS NOT IN THE ORIGINAL CODE !!
            if(Object.keys(mqlProperties.properties)[i] === 'type') {// TEMPORARY FIX by wvh TO AVOID HAVING TO DEAL WITH type INSTEAD OF PROPERTIES (i.e. Columns)
                debug('Early End of Round i: '+i);
                continue; // starts the next iteration of this loop
            }
            //
            if (mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['is_directive']) {
                switch (mqlProperties.properties[Object.keys(mqlProperties.properties)[i]].key) // TO DO: Will this retrieve the key ????  Test it !!!
                {
                    case 'limit':
                        mqlProperties.limit = mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['value'].toInt();
                        debug('mqlProperties.limit:');
                        debug(mqlProperties.limit);
                        if (mqlProperties.limit < 0) {
                            exit('Limit must not be less than zero.');
                        }
                        mqlProperties.query['limit'] = mqlProperties.limit;
                        break;
                }//eof switch 
            }//eof if  
            else if (typeof(mqlProperties.mql_node['outer_join']) !== 'undefined') {
                mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['outer_join'] = mqlProperties.mql_node['outer_join'];
                debug("mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['outer_join']:");
                debug(mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['outer_join']);
            }//eof else if
            
            debug("mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['schema']:");
            debug(mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['schema']);
            
            mqlProperties.schema = mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['schema'];
            debug('mqlProperties.schema:');
            debug(mqlProperties.schema);
            
            // THIS IS NOT IN THE ORIGINAL CODE !! BUT IS USED TO SET THE COLUMN NAME FOR LATER REFERENCE
//            if(typeof(mqlProperties.column_name) === 'undefined'){
//                mqlProperties.column_name = mqlProperties.schema_type.properties[Object.keys(mqlProperties.properties)[i]].column_name;
//                // WE MAY AS WELL ADD THE mqlProperties.column_name TO THE COLLECTION OF THE QUERY              //////  HAVE A LOOK AT handleNonFilterProperty TO MAKE SURE WE ARE NOT DUPLICATING CODE
//                //if(typeof(mqlProperties.query.columns) === 'undefined'){ mqlProperties.query.columns = [];}
//                //mqlProperties.query.columns.push(mqlProperties.column_name);
//                //
//            }
            //
            
            // ATTEMPT TO FIX BELOW MISTAKE HERE, REPLACES THE ABOVE COMMENTED CODE!! WORKS AS HOPED FOR !!
            mqlProperties.column_name = mqlProperties.schema_type.properties[Object.keys(mqlProperties.properties)[i]].column_name;
            
            
            // START OF BIG CHECK AREA HERE !!!!!  TURNS OUT NOW IT WORKS AS DESIGNED
            debug('==================================== START OF: BIG CHECK AREA ====================================');
            debug('mqlProperties.column_name:');
            debug(mqlProperties.column_name);
            debug('SHOULD MATCH WITH');
            debug("mqlProperties.schema['column_name']:");
            debug(mqlProperties.schema['column_name']);
            debug('==================================== END OF: BIG CHECK AREA ====================================');
            // END OF BIG CHECK AREA !!!!
            
            if (typeof(mqlProperties.schema['direction']) !== 'undefined') {
                mqlProperties.direction = mqlProperties.schema['direction'];
                if (mqlProperties.direction === 'referenced<-referencing') {
                    mqlProperties.index_columns = [];
                    mqlProperties.index_columns_string = '';                    
                    for (n = 0; n < Object.keys(mqlProperties.schema['join_condition']).length; n++) {    
                        debug('n:');
                        debug(n);
                        mqlProperties.column_ref = mqlProperties.tAlias + '.' + mqlProperties.schema['join_condition'][Object.keys(mqlProperties.schema['join_condition'])[n]]['referenced_column'];
                        if (typeof(mqlProperties.select[mqlProperties.column_ref]) !== 'undefined') {
                            mqlProperties.cAlias = mqlProperties.select[mqlProperties.column_ref];
                        }//eof if
                        else {
                            mqlProperties.cAlias = mqlProperties.tAlias.getCAlias(); // TO DO: Will this work???
                            mqlProperties.select[mqlProperties.column_ref] = mqlProperties.cAlias;
                        }//eof else
                        mqlProperties.index_columns_string = mqlProperties.index_columns_string + mqlProperties.cAlias;
                        mqlProperties.index_columns[0] = mqlProperties.cAlias;
                    }
                    if (typeof(mqlProperties.indexes[mqlProperties.index_columns_string]) === 'undefined') {
                        mqlProperties.indexes[mqlProperties.index_columns_string] = new Array({
                            'columns': mqlProperties.index_columns,
                            'entries': []
                        });
                    }//eof if         
                    mqlProperties.merge_into = new Array({
                        'query_index': mqlProperties.query_index,
                        'index': mqlProperties.index_columns_string,
                        'columns': []
                    });
                    mqlProperties.new_query_index = Object.keys(mqlProperties.queries).length;
                }//eof if                    
                else if ($direction === 'referencing->referenced') {
                    mqlProperties.merge_into = null;
                    mqlProperties.new_query_index = mqlProperties.query_index;
                }//eof else if                                          
                mqlProperties.properties[Object.keys(mqlProperties.properties)[i]]['query_index'] = mqlProperties.new_query_index;
                generateSQL(mqlProperties, function(err, mqlProperties) {
                    debug('>>> back inside generateSQL from generateSQL (itself!)'); // for testing only			
                    // TO DO			

                    debug('>>> leaving generateSQL');
                    mqlProperties.callBackHandleQuery(null, mqlProperties);
                });//eof generateSQL... a call to itself!                 
            }//eof if
                        
            // TO CHECK: SURELY WE WILL HAVE TO GO INTO UNDERNEATH ELSE TO SET THE FILTERING AND HAVE OUR COLUMN NAMES SET IN PARAMS.....
            //  |        FIND OUT WHY mqlProperties.column_name IS undefined
            //  V           UPDATE: WE HAVE FOR THE PURPOSE OF TESTING SET THE mqlProperties.column_name ABOVE
            
            else if (mqlProperties.column_name === mqlProperties.schema['column_name']) {
                
                debug("mqlProperties.properties[Object.keys(mqlProperties.properties)[i]][0]['is_filter']:");
                debug(mqlProperties.properties[Object.keys(mqlProperties.properties)[i]][0]['is_filter']);
                
                if (mqlProperties.properties[Object.keys(mqlProperties.properties)[i]][0]['is_filter']) {
                    mqlProperties.filter_property_key = Object.keys(mqlProperties.properties)[i];
                    mqlProperties.filter_property_value = mqlProperties.properties[Object.keys(mqlProperties.properties)[i]];
                    mqlProperties.operator = '=';
                    mqlProperties = handleFilterProperty(mqlProperties);
                    //   
                    // REPLACES handle_filter_property($queries, $query_index, $tAlias, $column_name, $property);
                }//eof if
                else {
                    debug('SURELY WE SHOULD BE GOING IN HERE FOR AT LEAST SOME OF THE COLUMNS *******************************')
                    mqlProperties.non_filter_property_key = Object.keys(mqlProperties.properties)[i];
                    mqlProperties.non_filter_property_value = mqlProperties.properties[Object.keys(mqlProperties.properties)[i]];
                    mqlProperties = handleNonFilterProperty(mqlProperties);                  
                    //  
                    // REPLACES handle_non_filter_property($tAlias, $column_name, $select, $property);
                }//eof else                    
            }//eof else if 
            debug('End of Round i: '+i);
        }//eof for
    }//eof if
    else if (arrayKeyExists('default_property', mqlProperties.schema_type)) {
        mqlProperties.default_property_name = mqlProperties.schema_type['default_property'];
        mqlProperties.properties = mqlProperties.schema_type['properties'];
        if (!arrayKeyExists(mqlProperties.default_property_name, mqlProperties.properties)) {
            exit('Default property "' + mqlProperties.default_property_name + '" specified but not found in "/' + mqlProperties.domain_name + '/' + mqlProperties.type_name + '"');
        }//eof if           
        mqlProperties.default_property = mqlProperties.properties[mqlProperties.default_property_name];
        mqlProperties.column_name = mqlProperties.default_property['column_name'];
        mqlProperties.property = mqlProperties.mql_node;
        mqlProperties.schema = mqlProperties.property['schema'];
        mqlProperties.schema['type'] = mqlProperties.default_property['type'];
        if (mqlProperties.property['is_filter']) {
            mqlProperties.filter_property_key = Object.keys(mqlProperties.property)[0]; // IS THIS THE RIGHT WAY TO HAND THE key??
            mqlProperties.filter_property_value = mqlProperties.property.value; // IS THIS THE RIGHT WAY TO HAND THE value??
            mqlProperties.operator = '=';
            mqlProperties = handleFilterProperty(mqlProperties);
            //     
            // REPLACES handle_filter_property($where, $params, $tAlias, $column_name, $property);              
        }//eof if        
        else {
            debug('SURELY WE SHOULD BE GOING IN HERE FOR AT LEAST SOME OF THE COLUMNS *******************************')
            mqlProperties.non_filter_property_key = Object.keys(mqlProperties.property)[0]; // IS THIS THE RIGHT WAY TO HAND THE key??
            mqlProperties.non_filter_property_value = mqlProperties.property.value; // IS THIS THE RIGHT WAY TO HAND THE value??
            mqlProperties = handleNonFilterProperty(mqlProperties);  
            // REPLACES handle_non_filter_property($tAlias, $column_name, $select, $property);
        }//eof else          
    }//eof else if
    debug('>>> leaving generateSQL');
    mqlProperties.callBackHandleQuery(null, mqlProperties);
}//eof generateSQL
/*****************************************************************************
 *   Execute Query / Render Result
 ******************************************************************************/

// helper for executeSQL: NOT a callback function
function prepareSQLStatement(mqlProperties) {
    debug('>>> inside prepareSQLStatement'); // for testing only

    if (typeof(mqlProperties.statement_cache) == 'undefined') {
        mqlProperties.statement_cache = [];
        debug('mqlProperties.statement_cache:');
        debug(mqlProperties.statement_cache);
    }//eof if

//REPLACES $statement_cache = array();

    if (typeof(mqlProperties.statement_cache[mqlProperties.sql]) !== 'undefined') {
        mqlProperties.statement_handle = mqlProperties.statement_cache[mqlProperties.sql];
        debug('mqlProperties.statement_handle:');
        debug(mqlProperties.statement_handle);
    }//eof if
    else {
        try {
            mqlProperties.statement_handle = mqlProperties.db_connection.createQuery(mqlProperties.sql); //prepared statement
            debug('mqlProperties.statement_handle:');
            debug(mqlProperties.statement_handle);
            mqlProperties.statement_cache[mqlProperties.sql] = mqlProperties.statement_handle;
            debug("mqlProperties.statement_cache[mqlProperties.sql]:");
            debug(mqlProperties.statement_cache[mqlProperties.sql]);
        }//eof try
        catch (ex) {
            debug('EXCEPTION at prepareSQLStatement:');
            debug(ex.message);
            // handle the exception here
        }//eof catch
    }//eof else


// REPLACES
//function prepare_sql_statement($statement_text){
//    global $pdo, $statement_cache;
//    if (isset($statement_cache[$statement_text])){
//        $statement_handle = $statement_cache[$statement_text];
//    } else {
//        $statement_handle = $pdo->prepare($statement_text);
//        $statement_cache[$statement_text] = $statement_handle;
//    }
//    return $statement_handle;
//}

    debug('>>> leaving prepareSQLStatement'); // for testing only
    return mqlProperties;
}//eof prepareSQLStatement

// helper for executeSQL
function pushToParametersArray(parameters, key, value) {
   debug('>>> inside pushToParametersArray');
   parameters[key] = value;
   debug('>>> leaving pushToParametersArray');
   return parameters;
}

// helper for executeSQLQuery: a callback function
function executeSQL(mqlProperties, cb) {
    debug('>>> inside executeSQL'); // for testing only
    mqlProperties.callBackExecuteSQLQuery = cb;
    debug('mqlProperties.sql:');
    debug(mqlProperties.sql);

    debug("mqlProperties.sql_query['params']:");
    debug(mqlProperties.sql_query['params']);

    debug('mqlProperties.limit:');
    debug(mqlProperties.limit);

    debug('mqlProperties.noexecute:');
    debug(mqlProperties.noexecute);

    if (mqlProperties.noexecute) {
        mqlProperties.result = [];
        return mqlProperties;
    }//eof if

    try {
        mqlProperties = prepareSQLStatement(mqlProperties);
        var parameters = {};
        debug("mqlProperties.sql_query['params'].length:");
        debug(mqlProperties.sql_query['params'].length);

        for (i = 0; i < mqlProperties.sql_query['params'].length; i++) {
            var param_key = [mqlProperties.sql_query['params'][i]['name']];
            var param_value = [mqlProperties.sql_query['params'][i]['value']][0]; // THE [0] REMOVES THE []
            parameters = pushToParametersArray(parameters, param_key, param_value);
        }//eof for
       
        var db_connection_created = mqlProperties.db_connection.createConnection(mqlProperties.db_connection_string);
        debug("db_connection_created:"); // for testing only
        debug(db_connection_created); // for testing only      

//        //FOR TESTING ONLY
//        mqlProperties.statement_handle.sql = 'SELECT * FROM core.tbl_person LIMIT 0,2';

        debug('parameters:');
        debug(parameters);

        mqlProperties.statement_handle = mqlProperties.db_connection.createQuery(mqlProperties.statement_handle.sql, parameters, function(err, result){ 
            if(err) throw err;
            // do nothing;
        });   
        debug('mqlProperties.statement_handle:');
        debug(mqlProperties.statement_handle);

        if (mqlProperties.limit === -1) {

            db_connection_created.query(mqlProperties.statement_handle.sql, function(err, rows) {
                if (err) {
                    mqlProperties.err = err;
                    debug('>>> leaving executeSQL from if with error:');
                    debug(err.message);
                    mqlProperties.callBackExecuteSQLQuery(err, mqlProperties);
                }

                // `rows` is an array with one element for every statement in the query:
                console.log('rows:');
                console.log(rows);

                mqlProperties.rows = rows;

                // Can we see this in here:
                console.log('mqlProperties.rows inside query:');
                console.log(mqlProperties.rows);

                mqlProperties.result = mqlProperties.rows;
                console.log('mqlProperties.result:');
                console.log(mqlProperties.result);

                console.log('this.sql:');
                console.log(this.sql);

                debug('>>> leaving executeSQL from if');
                mqlProperties.callBackExecuteSQLQuery(null, mqlProperties);
            });
        }//eof if
        else {
            mqlProperties.result = [];

            // STILL TO DO


//         // REPLACES
//           
//         while ($limit-- && $row = $statement_handle->fetch(PDO::FETCH_ASSOC)) {
//              $result[] = $row;
//         }

            mqlProperties.rows = mqlProperties.result;
            debug('>>> leaving executeSQL from else');
            mqlProperties.callBackExecuteSQLQuery(null, mqlProperties);
        }//eof else 
    }//eof try
    catch (ex) {
        debug(ex.message
                + ' Offending statement: '
                + mqlProperties.sql);
        mqlProperties.err = ex;
        debug('>>> leaving executeSQL with exception');
        mqlProperties.callBackExecuteSQLQuery(ex, mqlProperties);
    }//eof catch
}//eof executeSQL


// helper for executeSQLQuery: NOT a callback function
function getQuerySQL(mqlProperties) {
    debug('>>> inside getQuerySQL'); // for testing only

    debug('mqlProperties.sqlDialect:');
    debug(mqlProperties.sqlDialect);

    debug('mqlProperties.sql_query:');
    debug(mqlProperties.sql_query);

    mqlProperties.identifier_quote_start = mqlProperties.sqlDialect['identifier_quote_start'];
    debug('mqlProperties.identifier_quote_start:');
    debug(mqlProperties.identifier_quote_start);

    mqlProperties.identifier_quote_end = mqlProperties.sqlDialect['identifier_quote_end'];
    debug('mqlProperties.identifier_quote_end:');
    debug(mqlProperties.identifier_quote_end);

    mqlProperties.sql = 'SELECT';
    debug('mqlProperties.sql:');
    debug(mqlProperties.sql);
    // THESE WERE SET BEFORE, SUCCESSFULLY
    debug('mqlProperties.select_columns:');
    debug(mqlProperties.select_columns);
    debug("mqlProperties.select_columns === mqlProperties.sql_query['select']");
    debug(mqlProperties.select_columns === mqlProperties.sql_query['select']);  

    if (mqlProperties.select_columns === mqlProperties.sql_query['select']) {
        
        debug('mqlProperties.select_columns.length:');
        debug(mqlProperties.select_columns.length);
        
        debug('Object.keys(mqlProperties.select_columns).length:');
        debug(Object.keys(mqlProperties.select_columns).length);        

        for (i = 0; i < Object.keys(mqlProperties.select_columns).length; i++) {
            if (mqlProperties.sql === 'SELECT') {
                mqlProperties.sql = mqlProperties.sql
                        + '  '
                        + Object.keys(mqlProperties.select_columns)[i]
                        + ' AS '
                        + mqlProperties.select_columns[Object.keys(mqlProperties.select_columns)[i]];
            }//eof if
            else {
                mqlProperties.sql = mqlProperties.sql
                        + "\n" + ', '// USES " TO ASSURE THE ESCAPE
                        + Object.keys(mqlProperties.select_columns)[i]
                        + ' AS '
                        + mqlProperties.select_columns[Object.keys(mqlProperties.select_columns)[i]];
            }//eof else
        }//eof for 
    }//eof if
    else {
        mqlProperties.sql += ' NULL';
    }//eof else    
    debug('mqlProperties.sql:');
    debug(mqlProperties.sql);
    mqlProperties.optionality_groups = [];
    debug('mqlProperties.optionality_groups:');
    debug(mqlProperties.optionality_groups);
    
    for (i = 0; i < Object.keys(mqlProperties.sql_query['from']).length; i++) {
        debug("mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]:");
        debug(mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]);
        
//OLD        if (typeof(mqlProperties.sql_query['from'][i].value['optionality_group']) !== 'undefined') {
        if (typeof(mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['optionality_group']) !== 'undefined') {    
            
            mqlProperties.optionality_group_name = mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['optionality_group'];
            debug('mqlProperties.optionality_group_name:');
            debug(mqlProperties.optionality_group_name);
            if (!arrayKeyExists(mqlProperties.optionality_group_name, mqlProperties.optionality_groups)) {
                mqlProperties.optionality_groups[mqlProperties.optionality_group_name] = [];
            }//eof if
            mqlProperties.optionality_group = mqlProperties.optionality_groups[mqlProperties.optionality_group_name];
            mqlProperties.optionality_group[0] = mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['optionality_group_column'];
            debug('mqlProperties.optionality_group:');
            debug(mqlProperties.optionality_group);
        }//eof if 
        
        
        
        // CHECK IF WE GET THE WHERE SET SOMEWHERE... (PUN NOT INTENDED ;o)
        
        
        
        mqlProperties.from_or_join = Object.keys(mqlProperties.sql_query['from'])[i] && (typeof(mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['join_type']) !== 'undefined');
        debug('mqlProperties.from_or_join:');
        debug(mqlProperties.from_or_join);
        
        debug("mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]:");
        debug(mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]);
        
        debug("mqlProperties.sql_query['from']:");
        debug(mqlProperties.sql_query['from']);
        
        debug("arrayKeyExists('table', mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]])");
        debug(arrayKeyExists('table', mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]));
        
        
        if (mqlProperties.from_or_join) {
            mqlProperties.sql = mqlProperties.sql
                    + "\n"  // USES " TO ASSURE THE ESCAPE
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['join_type']
                    + ' JOIN '
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['table']
                    + ' '
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['alias']
                    + "\n"  // USES " TO ASSURE THE ESCAPE
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['join_condition'];
        }//eof if
        
        
        // SURELY WE WILL HAVE TO BE GOING INTO THE NEXT else if STATEMENT
        
        else if (arrayKeyExists('table', mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]])) {
            mqlProperties.sql = mqlProperties.sql
                    + "\n"+'FROM '  // USES " TO ASSURE THE ESCAPE
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['table']
                    + ' '
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['alias'];
        }//eof else if
        else if (mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['join_condition']) {
            //these are filter condition but we write them in the join
            //this is required to handle outer joins. 
            mqlProperties.sql = mqlProperties.sql
                    + "\n"  // USES " TO ASSURE THE ESCAPE
                    + mqlProperties.sql_query['from'][Object.keys(mqlProperties.sql_query['from'])[i]]['join_condition'];
        }//eof else if
        debug('mqlProperties.sql:');
        debug(mqlProperties.sql);
    }//eof for  
    
    debug('----------------------------------------WHERE--------------------------------------------------------');
    debug("mqlProperties.sql_query['where']:");
    debug(mqlProperties.sql_query['where']);
    debug('-----------------------------------------------------------------------------------------------------');    
    
    mqlProperties.where = mqlProperties.sql_query['where'];
    debug('mqlProperties.where:');
    debug(mqlProperties.where);
    for (i = 0; i < mqlProperties.optionality_groups.length; i++) {
        mqlProperties.condition_null = '';
        mqlProperties.condition_not_null = '';
        // foreach here
        for (n = 0; n < mqlProperties.optionality_groups[i].value.length; n++) {
            if (mqlProperties.condition_null !== '') {
                mqlProperties.condition_null = mqlProperties.condition_null
                        + ' AND ';
            }//eof if
            mqlProperties.condition_null = mqlProperties.condition_null
                    + mqlProperties.optionality_groups[i].value[n]
                    + ' IS NULL';
            if (mqlProperties.condition_not_null !== '') {
                mqlProperties.condition_not_null = mqlProperties.condition_not_null
                        + ' AND ';
            }//eof if
            mqlProperties.condition_not_null = mqlProperties.condition_not_null
                    + mqlProperties.optionality_groups[i].value[n]
                    + ' IS NOT NULL';
        }//eof for
        if (mqlProperties.where) {
            mqlProperties.where = mqlProperties.where
                    + "\n"+'AND';   // USES " TO ASSURE THE ESCAPE
        }//eof if
        else {
            mqlProperties.where = mqlProperties.where
                    + "\n"+'WHERE'; // USES " TO ASSURE THE ESCAPE
        }//eof else
        mqlProperties.where = mqlProperties.where
                + ' (('
                + mqlProperties.condition_null
                + ') OR ('
                + mqlProperties.condition_not_null
                + '))';
    }//eof for
    debug('mqlProperties.where:');
    debug(mqlProperties.where);
    if (mqlProperties.where) {
        mqlProperties.sql = mqlProperties.sql
                + "\n"  // USES " TO ASSURE THE ESCAPE
                + mqlProperties.where;
    }//eof if
    if (mqlProperties.sql_query['order_by']) {
        mqlProperties.sql = mqlProperties.sql
                + "\n"  // USES " TO ASSURE THE ESCAPE
                + mqlProperties.sql_query['order_by'];
    }//eof if
    debug('mqlProperties.sql:');
    debug(mqlProperties.sql);
    //TODO: this implementation of limit is buggy!
    //It works fine if applied to a top-level mql node,
    //When used for a nested mql node, it does not take into 
    //account that the limit should be applied only to the nested node
    if (mqlProperties.sql_query['limit']) {
        if (mqlProperties.sqlDialect['supports_limits']) {
            mqlProperties.sql = mqlProperties.sql
                    + 'n\LIMIT '
                    + mqlProperties.sql_query['limit'];
        }//eof if  
    }//eof if
    debug('>>> leaving getQuerySQL');
    return mqlProperties;
}// eof getQuerySQL


// helper for executeSQLQueries: a callback function
function executeSQLQuery(mqlProperties, cb) {
    debug('>>> inside executeSQLQuery'); // for testing only
    mqlProperties.callBackExecuteSQLQueries = cb;
    debug('mqlProperties.sqlDialect:');
    debug(mqlProperties.sqlDialect);

    if (mqlProperties.sql_query['limit'] && !mqlProperties.sqlDialect['supports_limit']) {
        //TO DO: this implementation of limit is buggy!
        //It works fine if applied to a top-level mql node,
        //When used for a nested mql node, it does not take into 
        //account that the limit should be applied only to the nested node    
        mqlProperties.limit = mqlProperties.sql_query['limit'];
    }//eof if
    else {
        //limit has been implemented directly in SQL
        mqlProperties.limit = -1;
    }//eof else

    debug('mqlProperties.limit:');
    debug(mqlProperties.limit);

    mqlProperties = getQuerySQL(mqlProperties); // TO DO implement function getQuerySQL()
    mqlProperties.sql_query['sql'] = mqlProperties.sql;

//OLD    return executeSQL(mqlProperties); // TO DO: implement function executeSQL

    executeSQL(mqlProperties, function(err, mqlProperties) {
        debug('>>> back inside executeSQLQuery from executeSQL');


        // TO DO


        debug('>>> leaving executeSQLQuery');
        mqlProperties.callBackExecuteSQLQueries(null, mqlProperties);
    });
//  REPLACES
//  return execute_sql($sql, $sql_query['params'], $limit);
}//eof executeSQLQuery

// helper for executeSQLQueries: NOT a callback function
function getResultObject(mqlProperties, index, object, key) {
    debug('>>> inside getResultObject'); // for testing only
    if (mqlProperties.mql_node['query_index'] !== index) {
        debug('>>> leaving getResultObject');
        return;
    }//eof if
    mqlProperties.object = [];
    if (mqlProperties.result_object instanceof Array) {
        mqlProperties.result_object[mqlProperties.key] = mqlProperties.object;
    }//eof if
    else {
        mqlProperties.result_object = mqlProperties.object;
    }//eof else
    if (typeof(mqlProperties.mql_node['entries']) !== 'undefined') {
        getResultObject(mqlProperties, index, mqlProperties.object, 0);
    }//eof if
    else if (typeof(mqlProperties.mql_node['properties']) !== 'undefined') {
        // TO DO
        for (i = 0; i < mqlProperties.mql_node['properties'].length; i++) {
            if (mqlProperties.mql_node['properties'][i]['operator'] || mqlProperties.mql_node['properties'][i]['is_directive']) {
                continue;
            }//eof if
            mqlProperties.value = mqlProperties.mql_node['properties'][i]['value'];
            debug('mqlProperties.value:');
            debug(mqlProperties.value);
            if (mqlProperties.value instanceof Object || mqlProperties.value instanceof Array) {
                getResultObject(mqlProperties, index, mqlProperties.object, mqlProperties.mql_node['properties'][i].key);
            }//eof if
            else {
                mqlProperties.object[mqlProperties.mql_node['properties'][i].key] = mqlProperties.value;
            }//eof else
        }//eof for     
    }//eof else if
    mqlProperties.mql_node['result_object'] = mqlProperties.object;
    debug('>>> leaving getResultObject');
    return mqlProperties.object;
}//eof getResultObject

// helper for handleQuery
function executeSQLQueries(mqlProperties, cb) {
    debug('>>> inside executeSQLQueries'); // for testing only
    mqlProperties.callBackHandleQuery = cb;
    debug('mqlProperties.queries:'); // for testing only
    debug(mqlProperties.queries); // for testing only 
    mqlProperties.sql_queries = mqlProperties.queries;
    
    debug('mqlProperties.sql_queries.length:');    
    debug(mqlProperties.sql_queries.length);
    
    for (i = 0; i < mqlProperties.sql_queries.length; i++) {  /// DOES THE length WORK HERE ???? YES IT DOES!
        // REPLACES foreach($sql_queries as $sql_query_index => &$sql_query){
        debug('i:'); // for testing only
        debug(i); // for testing only   

        mqlProperties.indexes = mqlProperties.sql_queries[i]['indexes'];
        debug('mqlProperties.indexes:'); // for testing only
        debug(mqlProperties.indexes); // for testing only 

        mqlProperties.mql_node = mqlProperties.sql_queries[i]['mql_node'];
        debug('mqlProperties.mql_node:'); // for testing only
        debug(mqlProperties.mql_node); // for testing only 

        getResultObject(mqlProperties, i); // NOT a callback function

        mqlProperties.result_object = mqlProperties.mql_node['result_object'];
        debug('mqlProperties.result_object:'); // for testing only
        debug(mqlProperties.result_object); // for testing only 
        
        // THIS IS TO MAKE SURE select_columns GETS SET: WORKS AS DESIGNED !!!
        // NOTE: THIS IS NOT PART OF THE ORIGINAL CODE
        if(typeof(mqlProperties.select_columns) === 'undefined'){
            mqlProperties.select_columns = mqlProperties.sql_queries[i]['select'];
            debug('mqlProperties.select_columns:'); // for testing only
            debug(mqlProperties.select_columns); // for testing only
        }//eof if
        
        debug('mqlProperties.merge_into:');
        debug(mqlProperties.merge_into); 
        
        debug("mqlProperties.sql_queries[i]['merge_into']:");
        debug(mqlProperties.sql_queries[i]['merge_into']);

        if (mqlProperties.merge_into === mqlProperties.sql_queries[i]['merge_into']) {
            mqlProperties.merge_into_columns = mqlProperties.merge_into['columns'];
            debug('mqlProperties.merge_into_columns:'); // for testing only
            debug(mqlProperties.merge_into_columns); // for testing only 

            mqlProperties.select_columns = mqlProperties.sql_queries[i]['select'];
            debug('mqlProperties.select_columns:'); // for testing only
            debug(mqlProperties.select_columns); // for testing only       

            mqlProperties.merge_into_values_new = [];
            debug('mqlProperties.merge_into_values_new:'); // for testing only
            debug(mqlProperties.merge_into_values_new); // for testing only       

            mqlProperties.merge_into_values_old = [];
            debug('mqlProperties.merge_into_values_old:'); // for testing only
            debug(mqlProperties.merge_into_values_old); // for testing only        

            mqlProperties.offset = -1;
            debug('mqlProperties.offset:'); // for testing only
            debug(mqlProperties.offset); // for testing only            

            mqlProperties.index_name = mqlProperties.merge_into['index'];
            debug('mqlProperties.index_name:'); // for testing only
            debug(mqlProperties.index_name); // for testing only 
            mqlProperties.index = mqlProperties.sql_queries[mqlProperties.merge_into['query_index']]['indexes'][mqlProperties.index_name];
            debug('mqlProperties.index:'); // for testing only
            debug(mqlProperties.index); // for testing only       
            mqlProperties.index_columns = mqlProperties.index['columns'];
            debug('mqlProperties.index_columns:'); // for testing only
            debug(mqlProperties.index_columns); // for testing only 

            mqlProperties.extra_from_line = new Array({
                'table': mqlProperties.index['inline_table'],
                'alias': mqlProperties.index_name
            });
            
            debug('-----------------------------------------------EXTRA FROM LINE-----------------------------------------------');
            debug('mqlProperties.extra_from_line:'); // for testing only
            debug(mqlProperties.extra_from_line); // for testing only 
            debug('-------------------------------------------------------------------------------------------------------------');

            mqlProperties.join_condition = '';
            debug('mqlProperties.join_condition:'); // for testing only
            debug(mqlProperties.join_condition); // for testing only       
            // TO DO

            for (n = 0; n < mqlProperties.index_columns.length; n++) {
                if (mqlProperties.join_condition === '') {
                    mqlProperties.join_condition = mqlProperties.join_condition
                            + 'ON'
                            + ' '
                            + mqlProperties.index_name
                            + '.'
                            + mqlProperties.index_columns[n]
                            + ' = '
                            + arraySearch(mqlProperties.merge_into_columns[mqlProperties.index_columns[n].key], mqlProperties.select_columns, true); // TO DO implement the function arraySearch()
                }//eof if 
                else {
                    mqlProperties.join_condition = mqlProperties.join_condition
                            + '\AND'
                            + ' '
                            + mqlProperties.index_name
                            + '.'
                            + mqlProperties.index_columns[n]
                            + ' = '
                            + arraySearch(mqlProperties.merge_into_columns[mqlProperties.index_columns[n].key], mqlProperties.select_columns, true); // TO DO implement the function arraySearch()
                }//eof else  
            }//eof for
            mqlProperties.from = mqlProperties.sql_queries[i]['from'];
            debug('mqlProperties.from:'); // for testing only
            debug(mqlProperties.from); // for testing only       

            mqlProperties.from[0]['join_condition'] = mqlProperties.mqlProperties.join_condition;
            debug("mqlProperties.from[0]['join_condition']:");
            debug(mqlProperties.from[0]['join_condition']);

            mqlProperties.from[0]['join_type'] = 'INNER';
            debug("mqlProperties.from[0]['join_type']:");
            debug(mqlProperties.from[0]['join_type']);
//    // REPLACES
//    //php guru's, isn't there a function to get the first element of an array?
//    foreach ($from as &$first_from_line) {
//      break; 
//    }
//    $first_from_line['join_condition'] = $join_condition;
//    $first_from_line['join_type'] = 'INNER';
            mqlProperties = arrayUnshift(mqlProperties, [mqlProperties.from, mqlProperties.extra_from_line]);
//    // REPLACES
//    array_unshift($from, $extra_from_line);
        }//eof if
        mqlProperties.result = mqlProperties.sql_queries[i]['results'];
        debug('mqlProperties.result:');
        debug(mqlProperties.result);

        mqlProperties.sql_query = mqlProperties.sql_queries[i];
        debug('mqlProperties.sql_query:');
        debug(mqlProperties.sql_query);

//      REPLACES      
//        
//      $result = &$sql_query['results'];

        executeSQLQuery(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside executeSQLQueries from executeSQLQuery'); // for testing only 			
            if (err) {
                debug('>>> leaving executeSQLQueries with error');
                mqlProperties.err = err;
                mqlProperties.callBackHandleQuery(err, mqlProperties);
            }
            debug('mqlProperties.rows:');
            debug(mqlProperties.rows);





            // WE ARE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE HERE

            debug('++++++++++++++++++ WE ARE NEAR LINE 2520 +++++++++++++++++++');



            for (m = 0; m < mqlProperties.rows.length; m++) {
                if (mqlProperties.merge_into) {
                    for (k = 0; k < mqlProperties.merge_into_columns.length; k++) {
                        mqlProperties.merge_into_values_new[mqlProperties.merge_into_columns[k].key] = mqlProperties.rows[m][mqlProperties.merge_into_columns[k].value];
                    }//eof for 
                    if (mqlProperties.merge_into_values_new !== mqlProperties.merge_into_values_old) {
                        mqlProperties = mergeResults('WHAT GOES HERE ????');// TO DO: implement function mergeResults()  
                        mqlProperties.offset = mqlProperties.rows[m].key;
                    }//eof if 
                    mqlProperties.merge_into_values_old = mqlProperties.merge_into_values_new;
                }//eof if
                mqlProperties = fillResultObject(mqlProperties); // TO DO: implement function fillResultObject()
                mqlProperties.result[mqlProperties.rows[m].key] = mqlProperties.result_object;
                mqlProperties = addEntryToIndexes(mqlProperties, mqlProperties.rows[m].key, mqlProperties.rows[m]); // TO DO: implement function addEntryTo Indexes()            
            }
            ;//eof for            
//          REPLACES  
//                    
//          foreach($rows as $row_index => $row){
//                    if ($merge_into){            
//                        foreach ($merge_into_columns as $col_index => $alias){
//                            $merge_into_values_new[$col_index] = $row[$alias];
//                        }
//                        if ($merge_into_values_new !== $merge_into_values_old){
//                            merge_results($sql_queries, $sql_query_index, $merge_into_values_old, $offset, $row_index);
//                            $offset = $row_index;
//                        }
//                        $merge_into_values_old = $merge_into_values_new;
//                    }
//                    fill_result_object($mql_node, $sql_query_index, $row, $result_object);
//                    $result[$row_index] = $result_object;
//                    add_entry_to_indexes($indexes, $row_index, $row);
//          }                    
            mqlProperties = createInlineTablesForIndexes(mqlProperties); // TO DO: implement function createInlineTablesForIndexes()
            if (typeof(mqlProperties.merge_into_values_old) !== 'undefined' && Object.keys(mqlProperties.merge_into_values_old).length) {
                mqlProperties = mergeResults('WHAT GOES HERE ????');// TO DO: implement function mergeResults()
            }//eof if          
//          REPLACES
//                    
//          create_inline_tables_for_indexes($indexes);
//          if (isset($merge_into_values_old) && count($merge_into_values_old)) {
//                    merge_results($sql_queries, $sql_query_index, $merge_into_values_old, $offset, $row_index);
//          }             
            debug('>>> leaving executeSQLQueries');
            mqlProperties.callBackHandleQuery(null, mqlProperties);
        });//eof executeSQLQuery               
//      REPLACES        
//      $rows = execute_sql_query($sql_query);     
    }//eof for
}//eof executeSQLQueries
/*****************************************************************************
 *   Queries
 ******************************************************************************/
function handleQuery(mqlProperties, cb) {
    debug('>>> inside handleQuery'); // for testing only 
    mqlProperties.callBackHandleQueries = cb;
    debug('mqlProperties.callBackHandleQueries:'); // for testing only	
    debug(mqlProperties.callBackHandleQueries); // for testing only	

    if (typeof(mqlProperties.args.debug_info) !== 'undefined') {
        mqlProperties.debug_info = mqlProperties.args['debug_info'];
    }
    else {
        mqlProperties.debug_info = false;
    }
    debug('mqlProperties.debug_info:'); // for testing only	
    debug(mqlProperties.debug_info); // for testing only

    if (typeof(mqlProperties.args.noexecute) !== 'undefined') {
        mqlProperties.noexecute = mqlProperties.args['noexecute'];
    }
    else {
        mqlProperties.noexecute = false;
    }
    debug('mqlProperties.noexecute:'); // for testing only	
    debug(mqlProperties.noexecute); // for testing only

    if (typeof(mqlProperties.args.debug_info) !== 'undefined') {
        var unixtime_ms = new Date().getTime();
        var sec = parseInt(unixtime_ms / 1000);
        var name = 'begin query #' + mqlProperties.queryKey;
        var microtime = (unixtime_ms - (sec * 1000)) / 1000 + ' ' + sec;
        mqlProperties.callStack.push({"name": name, "microtime": microtime});
        debug('mqlProperties.callStack:'); // for testing only
        debug(mqlProperties.callStack); // for testing only
    }
    debug('mqlProperties.queryOrQueries:'); // for testing only	
    debug(mqlProperties.queryOrQueries); // for testing only	
    //check if the query is an object
    if (!isObject(mqlProperties.queryOrQueries[0])) { // [0] removes the possible brackets, which would make it a non-object
        debug('mqlProperties.queryOrQueries[0] is not an object.');
        debug(mqlProperties.queryOrQueries[0]); // for testing only
        debug('>>> leaving handleQuery with error.');
        var err = new Error('mqlProperties.queryOrQueries[0] is not an object.');
        mqlProperties.err = err;
        mqlProperties.callBackHandleQueries(err, mqlProperties);
    }// eof if !isObject
    else {
        //var mql_query = mqlProperties.queryOrQueries[0];// [0] removes the possible brackets, which would make it a non-object
        debug('mqlProperties.queryOrQueries[0]:'); // for testing only	
        debug(mqlProperties.queryOrQueries[0]); // for testing only
        mqlProperties.parent = new Array();

        mqlProperties.schema = new Array();
        mqlProperties.domain_type = null;
        mqlProperties.domain_type_array;
        mqlProperties.domain = null;
        mqlProperties.type = null;

        mqlProperties.tAliasID = 0;
        mqlProperties.cAliasID = 0;
        mqlProperties.pAliasID = 0;

        // MQL Domains map to SQL schemas
        // MQL Types map to SQL tables
        // MQL properties can map to two things:
        //   - columns, in case the property type implies a value
        //   - foreign keys, which implement a relationship to a table
        mqlProperties.domain_type = mqlProperties.queryOrQueries[0].type;
        debug('mqlProperties.domain_type:'); // for testing only	
        debug(mqlProperties.domain_type); // for testing only
        mqlProperties.domain_type_array = mqlProperties.domain_type.split("/");
        debug('mqlProperties.domain_type_array:'); // for testing only	
        debug(mqlProperties.domain_type_array); // for testing only		
        mqlProperties.domain = mqlProperties.domain_type_array[1];
        debug('mqlProperties.domain:'); // for testing only	
        debug(mqlProperties.domain); // for testing only
        mqlProperties.type = mqlProperties.domain_type_array[2];
        debug('mqlProperties.type:'); // for testing only	
        debug(mqlProperties.type); // for testing only
        mqlProperties.schema['domain'] = mqlProperties.domain;
        mqlProperties.schema['type'] = mqlProperties.type;
        mqlProperties.parent['schema'] = mqlProperties.schema;
        debug('mqlProperties.parent:'); // for testing only	
        debug(mqlProperties.parent); // for testing only
        processMQL(mqlProperties, function(err, mqlProperties) {
            debug('>>> back inside handleQuery from processMQL'); // for testing only 			
            if (err) {
                mqlProperties.err = err;
                debug('>>> leaving handleQuery with error:');
                debug(err.message);
                mqlProperties.callBackHandleQueries(err, mqlQueries);
            }
            mqlProperties.sqlQueries = null;
            debug('mqlProperties.sqlQueries:'); // for testing only	
            debug(mqlProperties.sqlQueries); // for testing only            
            generateSQL(mqlProperties, function(err, mqlProperties) {
                debug('>>> back inside handleQuery from generateSQL'); // for testing only 				
                if (err) {
                    debug('>>> leaving handleQuery with error');
                    mqlProperties.err = err;
                    mqlProperties.callBackHandleQueries(err, mqlProperties);
                }
                
                // WE NEED TO MAKE SURE SOMEWHERE INSIDE processMQL THE VALUE FOR mql_node.types GETS SET
                // BECAUSE MOMENTARILY mql_node.types = ['0'] WE DO NOT GET A VALID SQL GENERATED !!! 
                
                executeSQLQueries(mqlProperties, function(err, mqlProperties) {
                    debug('>>> back inside handleQuery from executeSQLQueries'); // for testing only 				
                    if (err) {
                        debug('>>> leaving handleQuery with error');
                        mqlProperties.err = err;
                        mqlProperties.callBackHandleQueries(err, mqlProperties);
                    }//eof if



                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......
                    // WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......WE ARE HERE ......                                       



                    debug('executed_sql_queries:'); // for testing only //   THIS WILL MOST LIKELY BE A DIFFERENT NAME, CHECK WITH executeSQLQueries	
                    debug(executed_sql_queries); // for testing only	
                    var result = executed_sql_queries[0]['results']; // temp
                    debug('result:'); // for testing only	
                    debug(result); // for testing only		
                    var return_value = new Array({'code': '/api/status/ok', 'result': result});
                    if (debug_info) {
                        var sql_statements = [];
                        for (var i = 0; i < sql_queries.length; i++) {
                            sql_statements.push({'statement': sql_queries[i]['sql'],
                                'params': sql_queries[i]['params']});
                        }//eof for
                    }//eof if
                    args['sql'] = sql_statements;
                    var unixtime_ms = new Date().getTime();
                    var sec = parseInt(unixtime_ms / 1000);
                    var name = 'end query #' + mqlProperties.queryKey;
                    var microtime = (unixtime_ms - (sec * 1000)) / 1000 + ' ' + sec;
                    mqlProperties.callStack.push({"name": name, "microtime": microtime});
                    debug('mqlProperties.callStack:'); // for testing only
                    debug(mqlProperties.callStack); // for testing only
                    mqlProperties.args['timing'] = mqlProperties.callStack;
                    debug("mqlProperties.args['timing']:"); // for testing only
                    debug(mqlProperties.args['timing']); // for testing only
                    debug('return_value:'); // for testing only	
                    debug(return_value); // for testing only                                  
                    debug('>>> leaving handleQuery'); // for testing only
                    mqlProperties.callBackHandleQueries(null, mqlProperties);
                    /// HOORAY, WE MADE IT IF WE HAVE COME ALL THE WAY TO HERE !!!
                });//eof executeSQLQueries
            });//eof generateSQL
        });//eof processMQL
    } //eof else isObject
}// eof handleQuery

//for-enabled function to callback to analyzeProperty
function forHandleQuery(mqlProperties, item, index) {
    debug('>>> inside forHandleQuery'); // for testing only
    mqlProperties.handle_query = item;
    debug('mqlProperties.handle_query: *********************************************');
    debug(mqlProperties.handle_query);
    handleQuery(mqlProperties, function(err, mqlProperties) {
        debug('>>> back inside forHandleQuery from handleQuery'); // for testing only			
        mqlProperties.results[mqlProperties.queryKey] = mqlProperties.result;
        debug('mqlProperties.results[mqlProperties.queryKey]:');// for testing only
        debug(mqlProperties.results[mqlProperties.queryKey]);// for testing only	
        // THIS SHOULD INCLUDE THE FOLLOWING SURELY		
        debug('>>> leaving handleQuery from forHandleQuery'); // for testing only
        mqlProperties.callBackHandleRequest(null, mqlProperties);
    });//eof handleQuery
}//eof forHandleQuery

function handleQueries(mqlProperties) {
    debug('>>> inside handleQueries'); // for testing only
    mqlProperties.results = [];
    mqlProperties.results.push({'code': '/api/status/ok'});
    for (var queryKey = 0; queryKey < mqlProperties.queryOrQueries.length; queryKey++) { // TO DO: we do not know for sure that this mqlProperties.queryOrQueries.length is working
        debug('handleQueries: start of Round i=' + queryKey);
        mqlProperties.queryKey = queryKey;
        debug('mqlProperties.queryKey:');// for testing only
        debug(mqlProperties.queryKey);// for testing only
        // AS WE ARE INSIDE A FOR LOOP WE NEED TO USE THE FOR-ENABLED FUNCTION forHandleQuery
        forHandleQuery(mqlProperties, mqlProperties.queryOrQueries[queryKey], queryKey); // call the for-enabled function to callback to processMQL       
    }//eof for
}// eof handleQueries