var express = require('express');
var app = express();
var url = require('url');
var request = require('request');

var bodyParser = require('body-parser');
//var urlencodedParser = require('urlencodedParser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//use port is set in the environment variable, or 9001 if it isn’t set.
app.set('port', (process.env.PORT || 9001));

//for testing that the app is running
app.get('/', function(req, res){
  res.send('Running!!');
});

//app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/post', urlencodedParser, function(req, res){
  res.status(200).end()
  //take a message from Slack slash command
  var query = req.body.text
  res.status(200).end()
  var request = require('request');
  var reqBody = req.body
  var responseURL = reqBody.response_url
  
  if (reqBody.token != 'MPhZB1QYYYjYUsl225XQnuGC'){
         res.status(403).end("Access forbidden")
  }

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
          var hits = json_body['results'][0]['hits'];
          var attachments = [];
          var fields = [];
          var actions = [];
          fields.push({'title':'Priority', 'value':'High', 'short':'true'});
          actions.push({ 'name': 'name', 'text': 'Buy', 'type': 'button', 'value': 'Buy'  });

          hits.forEach(function(hit) {
                  attachments.push(
                  {
                      'attachment_type':'default',
                      'pretext': 'Product Code : '+hit.code +'\n Description : '+hit.description+' \nPrice :'+hit.prices['USD']+'\n',
                      'fallback':hit.description,
                      'color': '#36a64f',
                      'title': hit.description,
                      'text': hit.description,
                      'author_name':hit.prices['USD'],
                      'image_url': hit.image,
                      'thumb_url': hit.image,
                      'callback_id': hit.code,
                      'fields': fields,
                      'actions': actions
                  });
            });

            body = {
                response_type: "ephemeral",
                "attachments": attachments
            } 
            sendMessageToSlackResponseURL(responseURL, body)
     }
    
  });
});

//app.post is triggered when a POST request is sent to the URL ‘/post’
app.post('/view_cart', urlencodedParser, function(req, res){
  //res.status(200).end()
  //take a message from Slack slash command
  var query = req.body.text
  var request = require('request');
  var reqBody = req.body
  var responseURL = reqBody.response_url
  
  //if (reqBody.token != 'MPhZB1QYYYjYUsl225XQnuGC'){
   //      res.status(403).end("Access forbidden")
  //}

  var viewcart_url = 'https://api.beta.yaas.io/hybris/cart/v1/mobileux/carts/58b03313201ea0001dd16c4e?expandCalculation=false'

// Set the headers
var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type': 'application/json',
    'Authorization':'Bearer 022-e562bcbd-93b5-4535-bef0-44c1aa2d7dc5'
}

// Configure the request
var options = {
    url: viewcart_url,
    method: 'GET',
    headers: headers
}

var resmessage = "";

// Start the request
request(options, function (error, response, body) {
    console.log('Hello');
    if (!error && response.statusCode == 200) {
          var json_body = JSON.parse(body, "utf8");        
          var items = json_body['items'];
          console.log('Item :'+items);
          var attachments = [];
          var fields = [];
          var actions = [];
          fields.push({'title':'Priority', 'value':'High', 'short':'true'});
          actions.push({ 'name': 'name', 'text': 'Buy', 'type': 'button', 'value': 'Buy'  });

          items.forEach(function(item) {
                console.log("Data processing :"+'Product Code : '+item.product['id']+'\n Name : '+item.product['id']+' \nPrice :'+item.price['effectiveAmount']+'\n');
                attachments.push(
                  {
                      'attachment_type':'default',
                      'pretext': 'Product Code : '+item.product['id']+'\n Name : '+item.product['id']+' \nPrice :'+item.price['effectiveAmount']+'\n',
                      'color': '#36a64f',
                      'title': item.quantity,
                      'text': item.quantity,
                      'fields': fields
                  });
            });
         
            resmessage = {
                response_type: 'ephemeral',
                "attachments": attachments
            } 

           res.send(resmessage)

     }
    
  });
});

function sendMessageToSlackResponseURL(responseURL, JSONmessage){
    console.log('Response URL : '+responseURL)
    var postOptions = {
        uri: responseURL,
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        json: JSONmessage
    }
    request(postOptions, (error, response, body) => {
        if (error){
            console.log('Error while sending the response')
        }
    })
}

app.post('/slack/actions', urlencodedParser, (req, res) =>{
    res.status(200).end() // best practice to respond with 200 status
    var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
    var message = {
        //"text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
        "text": 'Slack Command Called',
        "replace_original": false
    }
    sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
})

//tells Node which port to listen on
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
