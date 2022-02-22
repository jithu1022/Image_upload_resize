const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const db = new AWS.DynamoDB();
const BUCKET_NAME = 's3uploader-s3uploadbucket-13r60zwgt5hk7'
const sharp = new require('sharp');
const shortURL =Math.random().toString(16).substr(2, 6);

exports.handler = async (event,callback) =>{
    const Key = event.Key;
    const height = event.height;
    const width = event.width;
    const longURL = `https://s3uploader-s3uploadbucket-13r60zwgt5hk7.s3.amazonaws.com/${Key}_resized.jpg`;

    const params = {
        Bucket : BUCKET_NAME,
        Key: `${Key}.jpg`
    }

    return s3.getObject(params).promise()
    .then(data => sharp(data.Body)
        .resize(width,height)
        .jpeg({ quality: 95, progressive: true })
        .toBuffer()
        )

    .then(buffer => s3.putObject({
        Body: buffer,
        Bucket: BUCKET_NAME,
        ContentType: "image/jpeg",
        Key : `${Key}_resized.jpg`,
        ACL : 'public-read'
    }).promise()
    )

    .then(db
        .putItem({
          TableName: "Shortened_URL",
          Item: {
            shortid: { S: shortURL },
            longURL: { S: longURL },
            owner: { S: "owner" }
          }
        }).promise()
    
    )
    .then(()=> {
        console.log("response post create");
        return `https://dqn68lfkil.execute-api.us-east-1.amazonaws.com/dev/${shortURL}` 
    })
    .catch(err=>
        {
            console.error(err);
            console.log(Key)
        })
}