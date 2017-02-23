var express = require('express');
var app = express();
var url = require('url');
var request = require('request');

var format = ".json";
var apikey = process.env.WU_ACCESS  //WU API key; will be set in Heroku

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use port is set in the environment variable, or 9001 if it isn’t set.
app.set('port', (process.env.PORT || 9001));

//for testing that the app is running
app.get('/', function(req, res){
  res.send('Running!!');
});

//app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/post', function(req, res){
  //take a message from Slack slash command
  var query = req.body.text
  var request = require('request');
  var myJSONObject = {
                      "requests":[
                          {
                            "indexName":"bot_index",
                            "params":"query=&hitsPerPage=10&maxValuesPerFacet=10&page=0&facets=%5B%22prices.USD%22%2C%22categories%22%2C%22brand%22%2C%22mixins.color-0f05d6s.color%22%5D&tagFilters=&facetFilters=%5B%5B%22mixins.color-0f05d6s.color%3AGreen%22%5D%5D"
                          }
                      ]
                    };

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded',
    'Content-Type': 'application/json',
    'X-Algolia-Application-Id':'YUMV65GQNH',
    'X-Algolia-API-Key':'41ef76dd21de15e84acec0d00f6b79ed'
}

// Configure the request
var options = {
    url: "https://YUMV65GQNH.algolia.net/1/indexes/*/queries?X-Algolia-API-Key=41ef76dd21de15e84acec0d00f6b79ed&X-Algolia-Application-Id=YUMV65GQNH",
    method: 'POST',
    headers: headers,
    json: true,
    //form: {'key1': 'xxx', 'key2': 'yyy'}
    body: myJSONObject
}

var body = "";

// Start the request
request(options, function (error, response, body) {
    console.log('Hello');
    if (!error && response.statusCode == 200) {
      
      var convertedObjects = JSON.stringify(body);
          //console.log('Printing body :'+convertedObjects)

          var json_body = JSON.parse(convertedObjects, "utf8");
          console.log('JSON :'+json_body['results'][0]['page']);

          var hits = json_body['results'][0]['hits'];
          var i = 0;
          var attachments = {};
          hits.forEach(function(hit) {
                  console.log(hit.code);
                  console.log(hit.description);
                  console.log(hit.prices['USD']);
                  console.log(hit.image);
                  
                  attachments[i] = {};
                  attachments[i].pretext=hit.code;
                  attachments[i].title=hit.description;
                  attachments[i].author=hit.prices['USD'];
                  attachments[i].image_url= hit.image;
                  attachments[i].thumb_url= hit.image;
                  i= i=1;
            });

            body = {
                response_type: "in_channel",
                "attachments": attachments
            } 
            console.log('body '+body)
            res.send(body);

    }
    
  });
  //res.send(body);
});

     

//tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
