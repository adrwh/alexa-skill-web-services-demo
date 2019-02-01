/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core')
const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Alexa Skills Web Services Demo.  I am going to show you how to use amazon web services with your skill.  You can say "Get X.Y.Z Demo, for example Get S 3 demo"'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Alexa Skills Web Services Demo', speechText)
      .getResponse()
  },
}

//
// ---------------- GetSThreeIntentHandler
// 

const GetSThreeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetSThreeIntent'
  },
  async handle(handlerInput) {
    let speechText

    let options = {
      "Bucket": "alexa-skill-aws-demo",
      "Key": "s3-demo.txt"
    }

    await goGetS3(options)
      .then((response) => {
        console.log(`RESPONSE: ${response}`)
        speechText = response
      })
      .catch((err) => {
        console.log(`CATCH err: ${err}`)
        speechText = 'S3 we have a problem!'
      })

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('S3 Web Services Demo', speechText)
      .getResponse()
  },
}

//
// ---------------- PutDynamoDBIntentHandler
// 

const PutDynamoDBIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PutDynamoDBIntent'
  },
  async handle(handlerInput) {
    
    let name = handlerInput.requestEnvelope.request.intent.slots.name.value
    let timestamp = new Date().getTime()
    let speechText

    const dynamodbParams = {
      TableName: 'alexa-skill-web-services-demo',
      Item: {
        name: name,
        modified: timestamp,
      },
    }

    console.log(`Attempting to add ${name}`)  
      
    await dynamoDb.put(dynamodbParams).promise()
    .then(data => {
      console.log(`Successfully added ${name} to Dynamo`)
      speechText = `Successfully added ${name} to Dynamo`
    })
    .catch(err => {
      console.log(`CATCH err: ${err}`)
      speechText = 'Dynamo, we have a problem.'
    })

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('DynamoDB Web Services Demo', speechText)
      .getResponse()
  }
}

//
// ---------------- GetDynamoDBIntentHandler
//

const GetDynamoDBIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetDynamoDBIntent'
  },
  async handle(handlerInput) {
    
    let name = handlerInput.requestEnvelope.request.intent.slots.name.value
    let speechText
    console.log(`get params ${name}`)
    
    const dynamodbParams = {
      TableName: 'alexa-skill-web-services-demo',
      Key: {'name': name}
    }

    console.log(`Attempting to get ${name}`)  
      
    await dynamoDb.get(dynamodbParams).promise()
    .then(data => {
      console.log(`Successfully got ${data.Item.name} from Dynamo`)
      speechText = `Successfully got ${data.Item.name} from Dynamo`
    })
    .catch(err => {
      console.log(`CATCH err: ${err}`)
      speechText = 'Dynamo, we have a problem.'
    })

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('DynamoDB Web Services Demo', speechText)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Alexa Skills Web Services Demo', speechText)
      .getResponse()
  },
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Alexa Skills Web Services Demo', speechText)
      .getResponse()
  },
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)

    return handlerInput.responseBuilder.getResponse()
  },
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse()
  },
}

const goGetS3 = function (options) {
  return new Promise((resolve, reject) => {
    let s3 = new AWS.S3({apiVersion: '2006-03-01'})
    s3.getObject(options, function (err, data) {
      //handle error
      if (err) {
        console.log(`ERROR: ${err}`)
        reject("Error", err)
      }
      //success
      if (data) {
        resolve(data.Body.toString())
      }
    })
  })
}


const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetSThreeIntentHandler,
    PutDynamoDBIntentHandler,
    GetDynamoDBIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
