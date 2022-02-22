'use strict'

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.AWS_REGION })
const s3 = new AWS.S3()
const dynamodb = new AWS.DynamoDB();

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300

// Main Lambda entry point
exports.handler = async (event) => {
  return await getUploadURL(event)
}

const getUploadURL = async function(event) {
  const randomID = parseInt(Math.random() * 10000000)
  const Key = `${randomID}.jpg`

  // Get signed URL from S3
  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'image/jpeg',
  }

  console.log('Params: ', s3Params)
  const uploadURL = await s3.getSignedUrlPromise('putObject', s3Params)
  const shortURL = shortener(Key)
  return JSON.stringify({
    uploadURL: uploadURL,
    Key,
    shortURL 
  })
}

const shortener = async(Key) => {
  const longURL = `https://s3uploader-s3uploadbucket-13r60zwgt5hk7.s3.amazonaws.com/${Key}`;
  const shortURL =Math.random().toString(16).substr(2, 6);
  if (longURL){
  return dynamodb
    .putItem({
      TableName: "Shortened_URL",
      Item: {
        shortid: { S: shortURL },
        longURL: { S: longURL },
        owner: { S: "owner" }
      }
    })
    .promise()
    .then(data => {
      console.log("response post create", data);
      return `https://dqn68lfkil.execute-api.us-east-1.amazonaws.com/dev/${shortURL}` 
    })
    .catch(err => {
      console.error("error", err);
      return err;
    });
}};
