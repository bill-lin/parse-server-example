// Example express application adding the parse-server module to expose Parse
// compatible API routes.
require ('newrelic');

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var S3Adapter = require('parse-server').S3Adapter;
var OSSAdapter = require('parse-server-oss-adapter');

var OssS3Adapter = require('./lib/oss_s3_adapter');

var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}



var s3Adapter = new S3Adapter(
                      process.env.AWS_ACCESS_KEY_ID ||"AWS_ACCESS_KEY_ID",
                      process.env.AWS_SECRET_ACCESS_KEY ||"AWS_SECRET_ACCESS_KEY",
                      process.env.AWS_S3_BUCKET_NAME || 'BUCKET_NAME',
                      { directAccess: true }
                    );

var ossAdapter = new OSSAdapter(
                      process.env.OOS_ACCESS_KEY ||"OSS_ACCESS_KEY_ID",
                      process.env.OOS_SECRET_KEY ||"OSS_SECRET_ACCESS_KEY",
                      process.env.OOS_BUCKET || 'OSS_BUCKET_NAME',
                      { directAccess: true }
                    );

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  fileKey: process.env.FILE_KEY || 'myFileKey',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
//  liveQuery: {
//    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
//  },
  filesAdapter: new OssS3Adapter(s3Adapter, ossAdapter, s3Adapter)
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
//ParseServer.createLiveQueryServer(httpServer);
