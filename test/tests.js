module('AJAX test read');
asyncTest('OPTIONS[\'test\']',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/read",
		data: "test=1",
		success: function(){
			start();
			ok(true,"AJAX call for test read successful");
		},
		error: function(){
			start();
			ok(false,'AJAX call for test read failed');
		}
	});
});

module('AJAX test write');
asyncTest('OPTIONS[\'test\']',function(){
	$.ajax({
		type: "OPTIONS",
		url: "http://localhost:3000/services/test/write",
		data: "test=1",
		success: function(){
			start();
			ok(true,"AJAX call for test write successful");
		},
		error: function(){
			start();
			ok(false,'AJAX call for test write failed');
		}
	});
});

module('AJAX MQL read simple');
asyncTest('OPTIONS[\'test\']',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/read",
		dataType: "json",
		data: '{"pagination":{"page":0,"limit":50,"sort":"PersonLastName","dir":"ASC"},"basicInfo":{"ccoId":"QUnit","prefLang":"eng_GB","requestStartDate":null,"requesterApp":"QUnit"},"mql":{"query":[{"type":"/core/person","kp_PersonID":null,"kf_SalutationID":null,"kf_GenderID":2,"PersonFirstName":null,"PersonLastName":null}]},"debug_info":{}}',
		success: function(data){
			start();
			ok(true,"AJAX call for MQL read simple successful");
		},
		error: function(data){
			start();
			ok(false,'AJAX call for MQL read simple failed');
		}
	});
});

module('AJAX MQL read complex');
asyncTest('OPTIONS[\'test\']',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/read",
		dataType: "json",
		data: '{"pagination":{"page":0,"limit":50,"sort":"PersonLastName","dir":"ASC"},"basicInfo":{"ccoId":"QUnit","prefLang":"eng_GB","requestStartDate":null,"requesterApp":"QUnit"},"mql":{"query":[{"type":"/core/person","kp_PersonID":null,"kf_SalutationID":null,"kf_GenderID":null,"PersonFirstName":null,"PersonLastName":null,"PersonGender":{"kp_GenderID":2,"GenderName":null}}]},"debug_info":{}}',
		success: function(data){
			start();
			ok(true,"AJAX call for MQL read complex successful");
		},
		error: function(data){
			start();
			ok(false,'AJAX call for MQL read complex failed');
		}
	});
});

module('AJAX MQL write');
asyncTest('OPTIONS[\'test\']',function(){
	$.ajax({
		contentType: "application/json; charset=utf-8",
		type: "OPTIONS",
		url: "http://localhost:3000/services/mql/write",
		dataType: "json",		
		data: '{}',
		success: function(data){
			start();
			ok(true,"AJAX call for MQL write successful");
		},
		error: function(data){
			start();
			ok(false,'AJAX call for MQL write failed');
		}
	});
});



