Ext.Ajax.request({
	defaultHeaders: 'Access-Control-Allow-Origin : vanheemstrapictures.com',
    url: 'http://api.vanheemstrapictures.com',
    params: {
        id: 1
    },
    success: function(response){
        var text = response.responseText;
        // process server response here
    }
});