exports.handler = (event, context, callback) => {
  const request = require('request');
  const AWS = require('aws-sdk');

  const options = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': `Basic ${process.env.TOKEN}`
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };
  
  request.post(options, (err, response, body) => {
    if (err || response.statusCode !== 200) {
      return console.log(err, body);
    }
    
    // use the access token to access the Spotify Web API
    const token = body.access_token;

    // Update the file in s3
    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      apiVersion: '2006-03-01'
    });
    const params = {
      Body: `window.ts="${token}"`, 
      Bucket: 'moodfuse.com', 
      Key: "ts.js", 
      ServerSideEncryption: "AES256", 
      Tagging: "key1=value1&key2=value2",
      CacheControl: 'max-age=1800'
    };
  
    s3.putObject(params, (err) => {
      if (err) {
        return console.log(err, err.stack);
      }
    });
  });
};