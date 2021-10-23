const PORT = process.env.PORT || 3001;
const express = require('express');
const responseTime = require('response-time')
const axios = require('axios');
const redis = require('redis');
const app = express();
require('dotenv').config();
const AWS = require('aws-sdk');
// Cloud Services Set-up
// Create unique bucket name
const bucketName = 'costaandoldmatebucket';
// Create a promise on S3 service object
const bucketPromise = new AWS.S3({apiVersion: '2006-03-01'}).createBucket({Bucket: bucketName}).promise();
bucketPromise.then(function(data) {
 console.log("Successfully created " + bucketName);
})
.catch(function(err) {
 console.error(err, err.stack);
});

const redisClient = redis.createClient();
redisClient.on('error', (err) => {
 console.log("Error " + err);
});

app.use(responseTime());

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/image", async (req, res) => {
  const query = req.query.query.trim();
  // Construct the flickr URL and key
  const APIKEY = "ffd6e3622d2137fe60a38874ba4a2464";
  const searchUrl = `https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=ffd6e3622d2137fe60a38874ba4a2464&tags=${query}&per-page=1&format=json&media=photos&nojsoncallback=1`;

  //image is returned in https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg format
  // axios.get(searchUrl).then((response) => {
  //   const responseJSON = response.data;
  //   res.status(200).json({ responseJSON });
  // });

  const fetch_res = await fetch(searchUrl);
  const json = await fetch_res.json();
  console.log(req);
  res.json(json.photos.photo);
});


//Search for image
//TODO parse resposne in form https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_{mstzb}.jpg and process with ai.
app.get('/api/search', (req, res) => {
 const query = (req.query.query).trim();
 // Construct the flickr URL and key
 const APIKEY = 'ffd6e3622d2137fe60a38874ba4a2464';
 const searchUrl = `https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=ffd6e3622d2137fe60a38874ba4a2464&tags=${query}&per-page=50&format=json&media=photos&nojsoncallback=1`;
 const redisKey = `flickr:${query}`;
 const s3Key = `flickr-${query}`;
 const params = { Bucket: bucketName, Key: s3Key};

// Try the cache
 return redisClient.get(redisKey, (err, result) => {
   if (result) {
     // Serve from Cache
     console.log("from redis");
     const resultJSON = JSON.parse(result);
     resultJSON.source = 'Redis Cache';
    return res.status(200).json({ source: 'Redis Cache', ...resultJSON, });
   } else {

     //Check if in s3
     return new AWS.S3({apiVersion: '2006-03-01'}).getObject(params, (err, results3) => {

       if (results3) {
         // Serve from S3
         console.log("from s3");
         const resultsJSON = JSON.parse(results3.Body);
         var redisResult = resultsJSON.parse;
         redisClient.setex(redisKey, 3600, JSON.stringify({ source: 'Redis Cache', ...resultsJSON, }));
         return res.status(200).json(resultsJSON);

     } else{
       return axios.get(searchUrl)
          .then(response => {
          const responseJSON = response.data;
          redisClient.setex(redisKey, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
          const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON});
          const objectParams = {Bucket: bucketName, Key: s3Key, Body: body};
          const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
          uploadPromise.then(function(data) {
            console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
            console.log("Successfully uploaded data to redis Cache");
          });
          return res.status(200).json({ source: 'Flickr API', ...responseJSON, });
        })
        .catch(err => {
          return res.json(err);
        });
     }
  });

   }

 });
});

//Store image in s3
app.get('/api/store', (req, res) => {
 const key = (req.query.key).trim();
 // Construct the flickr URL and S3 key
 const searchUrl = `https://api.flickr.com/services/rest/?&method=flickr.photos.search&api_key=ffd6e3622d2137fe60a38874ba4a2464&tags=${key}&per-page=50&format=json&media=photos&nojsoncallback=1`;
 const s3Key = `flickr-${key}`;

 // Check S3
 const params = { Bucket: bucketName, Key: s3Key};
 console.log(s3Key);
 return new AWS.S3({apiVersion: '2006-03-01'}).getObject(params, (err, result) => {
   if (result) {
     // Serve from S3
     console.log(result);
     const resultJSON = JSON.parse(result.Body);
     return res.status(200).json(resultJSON);

 } else {
 // Serve from flickr API and store in S3
  return axios.get(searchUrl)
    .then(response => {
      const responseJSON = response.data;
      const body = JSON.stringify({ source: 'S3 Bucket', ...responseJSON});
      const objectParams = {Bucket: bucketName, Key: s3Key, Body: body};
      const uploadPromise = new AWS.S3({apiVersion: '2006-03-01'}).putObject(objectParams).promise();
      uploadPromise.then(function(data) {
        console.log("Successfully uploaded data to " + bucketName + "/" + s3Key);
      });
      return res.status(200).json({ source: 'Flickr API', ...responseJSON, });
 })
 .catch(err => {
    return res.json(err);
      });
    }
  });
 });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
