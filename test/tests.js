/*
 * MODULE
 */
module('AJAX MQL read simple: Person');
asyncTest('Server Running at Start',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at Start: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at Start: failed');
		}
	});
});
asyncTest('Retrieve PERSONS',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/read",
		dataType: "json",
		data: '{"pagination":{"page":0,"limit":50,"sort":"PersonLastName","dir":"ASC"},"basicInfo":{"ccoId":"QUnit","prefLang":"eng_GB","requestStartDate":null,"requesterApp":"QUnit"},"mql":{"query":[{"type":"/core/person","kp_PersonID":null,"kf_SalutationID":null,"kf_GenderID":2,"PersonFirstName":null,"PersonLastName":null}]},"debug_info":{}}',
		success: function(response){
			start();
			ok(true,"Retrieve PERSONS: successful: "+JSON.stringify(response));
		},
		error: function(response){
			start();
			ok(false,'Retrieve PERSONS: failed: '+JSON.stringify(response));
		}
	});
});
asyncTest('Server Running at End',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at End: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at End: failed');
		}
	});
});
/*
 * MODULE
 */ 
module('AJAX MQL read complex: Person & Gender');
asyncTest('Server Running at Start',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at Start: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at Start: failed');
		}
	});
});
asyncTest('Retrieve PERSONS & GENDERS',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/read",
		dataType: "json",
		data: '{"pagination":{"page":0,"limit":50,"sort":"PersonLastName","dir":"ASC"},"basicInfo":{"ccoId":"QUnit","prefLang":"eng_GB","requestStartDate":null,"requesterApp":"QUnit"},"mql":{"query":[{"type":"/core/person","kp_PersonID":null,"kf_SalutationID":null,"kf_GenderID":null,"PersonFirstName":null,"PersonLastName":null,"PersonGender":{"kp_GenderID":2,"GenderName":null}}]},"debug_info":{}}',
		success: function(response){
			start();
			ok(true,"Retrieve PERSONS & GENDERS: successful: "+JSON.stringify(response));
		},
		error: function(response){
			start();
			ok(false,'Retrieve PERSONS & GENDERS: failed: '+JSON.stringify(response));
		}
	});
});
asyncTest('Server Running at End',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at End: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at End: failed');
		}
	});
});
/*
 * MODULE
 */
module('AJAX MQL read simple: Deck');
asyncTest('Server Running at Start',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at Start: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at Start: failed');
		}
	});
});
asyncTest('Retrieve DECKS',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/read",
		dataType: "json",
		data: '{"pagination":{"page":0,"limit":50,"sort":"DeckName","dir":"ASC"},"basicInfo":{"ccoId":"QUnit","prefLang":"eng_GB","requestStartDate":null,"requesterApp":"QUnit"},"mql":{"query":[{"type":"/core/deck","kp_DeckID":1,"DeckName":null,"DeckDescription":null}]},"debug_info":{}}',
		success: function(response){
			start();
			ok(true,"Retrieve DECKS: successful: "+JSON.stringify(response));
		},
		error: function(response){
			start();
			ok(false,'Retrieve DECKS: failed: '+JSON.stringify(response));
		}
	});
});
asyncTest('Server Running at End',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at End: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at End: failed');
		}
	});
});
/*
 * MODULE
 */
module('AJAX MQL write');
asyncTest('Server Running at Start',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at Start: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at Start: failed');
		}
	});
});
asyncTest('Provide PERSONS',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/write",
		dataType: "json",		
		data: '{}',
		success: function(response){
			start();
			ok(true,"Provide PERSONS: successful: "+JSON.stringify(response));
		},
		error: function(response){
			start();
			ok(false,'Provide PERSONS: failed: '+JSON.stringify(response));
		}
	});
});
asyncTest('Server Running at End',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"Server Running at End: successful");
		},
		error: function(){
			start();
			ok(false,'Server Running at End: failed');
		}
	});
});