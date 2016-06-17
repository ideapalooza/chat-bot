'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const _ = require('lodash')

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
  res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'foo') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})

var defaultResponse = "Sounds like one of our representatives can help you. Give us a call at (855) 385-5356."

// to post data
app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      if (_.includes(text, 'loan')) {
        greet(sender)
        continue
      } else if (_.includes(text, 'borrow')) {
        approveAmount(sender, text)
        continue
      } else if (_.includes(text, 'business name is')) {
        businessName(sender, text)
        continue
      } else if (_.includes(test, "years")) {
        yearsInBusiness(sender, text)
      }
      sendTextMessage(sender, defaultResponse);
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
      continue
    }
  }
  res.sendStatus(200)
})


const token = process.env.PAGE_ACCESS_TOKEN

function sendTextMessage(sender, text) {
  let messageData = { text:text }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function greet(sender) {
  var text = "It sounds like you're looking for a loan. How much do you want to borrow?";
  sendTextMessage(sender, text);
}

function approveAmount(sender, text) {
  var successResponse = "Excellent, that’s a perfect fit. What’s your business called?"
  var failureResponse = "Unfortunately, we can only fund loans between $25,000 and $500,000."
  var amount = text.match(/\d+/);

  if (amount >= 25000 && amount <= 500000) {
    sendTextMessage(sender, successResponse);
  } else {
    sendTextMessage(sender, failureResponse);
  }
}

function businessName(sender, text) {
  var name = text.replace('My business name is ','');
  var successResponse = "Excellent, " + name + " is a great name. How long have you been in business?"
  var failureResponse = "Unfortunately, we don't recognize your name, try again"

  sendTextMessage(sender, successResponse);
}

function yearsInBusiness(sender, text) {
  var successResponse = "Great. What were your total sales for the last year?"
  var failureResponse = "Unfortunately, we can only lend to businesses that are at least 2 years old."

  var years = text.match(/\d+/);

  if (years >= 2) {
    sendTextMessage(sender, successResponse);
  } else {
    sendTextMessage(sender, failureResponse);
  }
}



// spin spin sugar
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'))
})
