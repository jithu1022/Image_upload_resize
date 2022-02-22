const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event,context) => {
 return dynamodb
    .getItem({
      TableName: "URL_Shortener",
      Key: {
        shortid: {S: event.shortid}
      }
    })
    
    .promise()
    .then(response => {
      var err = new Error("HandlerDemo.ResponseFound Redirection: Resource found elsewhere");
      err.name = response.Item.longURL.S;
      context.done(err, {});
    })
};