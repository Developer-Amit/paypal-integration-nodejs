/*
 * Author: Amit Mishra
 * App Name: Paypal Integrations in NodeJs
 * Website: developeramitmishra.tk
 * Description: Paypal payment gateway integrations in nodejs 
 */
var http=require('http');
var express    = require("express");
var paypal = require('paypal-rest-sdk');
var bodyParser = require('body-parser');
var app = express();
var port = Number(process.env.PORT || 8000);
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
}));
app.locals.baseurl = 'http://localhost:8000';
 
// paypal auth configuration
var config = {
  "port" : 8000,
  "api" : {
    "host" : "api.sandbox.paypal.com",
    "port" : "",            
    "client_id" : "MY_KEY",  // your paypal application client id
    "client_secret" : "MY_KEY" // your paypal application secret id
  }
}
 
paypal.configure(config.api);
 
// Page will display after payment has beed transfered successfully
app.get('/success', function(req, res) {
  res.send("Payment transfered successfully.");
  window.location('http://localhost:8000');
});
 
// Page will display when you canceled the transaction 
app.get('/cancel', function(req, res) {
  res.send("Payment canceled successfully.");
  window.location('http://localhost:8000');
});
 
app.get('/', function(req, res) {
   res.sendFile(__dirname+'/index.html');
});
 
app.post('/paynow', function(req, res) {
   // paypal payment configuration.
  var payment = {
  "intent": "sale",
  "payer": {
    "payment_method": "paypal"
  },
  "redirect_urls": {
    "return_url": app.locals.baseurl+"/success",
    "cancel_url": app.locals.baseurl+"/cancel"
  },
  "transactions": [{
    "amount": {
      "total":parseInt(req.body.amount),
      "currency":  req.body.currency
    },
    "description": req.body.description
  }]
};
 
  paypal.payment.create(payment, function (error, payment) {
  if (error) {
    console.log(error);
  } else {
    if(payment.payer.payment_method === 'paypal') {
      req.paymentId = payment.id;
      var redirectUrl;
      console.log(payment);
      for(var i=0; i < payment.links.length; i++) {
        var link = payment.links[i];
        if (link.method === 'REDIRECT') {
          redirectUrl = link.href;
        }
      }
      res.redirect(redirectUrl);
    }
  }
});
});
 
// Starting server
var server = http.createServer(app).listen(port, function() {
console.log("Listening on " + port);
});