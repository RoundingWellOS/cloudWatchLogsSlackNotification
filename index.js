const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const encrypted = process.env['SLACK_TOKENS'];
let decrypted;
function processEvent(event, context, callback) {
    const https = require('https');
    const util = require('util');
    const slackTokens = decrypted
    const alert = event.Records[0].Sns
    const message = JSON.parse(alert.Message)
    const logGroup = message.Trigger.Namespace
    const postData = {
        "channel": "#errors",
        "text": "*" + alert.Subject + "*"
    };
    const severity = "danger";
    const options = {
        method: 'POST',
        hostname: 'hooks.slack.com',
        port: 443,
        path: '/services/'+slackTokens
    };

    postData.attachments = [
        {
            "color": severity, 
            "text": 'Alert has been triggered. See https://' + AWS.config.region + '.console.aws.amazon.com/cloudwatch/home?region=' + AWS.config.region + '#logStream:group=' + logGroup + ' for more details.'
        }
    ];

    const req = https.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        context.done(null);
      });
    });
    
    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });    

    req.write(util.format("%j", postData));
    req.end();
};

exports.handler = (event, context, callback) => {
    if (decrypted) {
        processEvent(event, context, callback);
    } else {
        // Decrypt code should run once and variables stored outside of the function
        // handler so that these are decrypted once per container
        const kms = new AWS.KMS();
        kms.decrypt({ CiphertextBlob: new Buffer(encrypted, 'base64') }, (err, data) => {
            if (err) {
                console.log('Decrypt error:', err);
                return callback(err);
            }
            decrypted = data.Plaintext.toString('ascii');
            processEvent(event, context, callback);
        });
    }
};
