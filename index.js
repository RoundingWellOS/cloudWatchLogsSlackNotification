const AWS = require('aws-sdk');

const encrypted = process.env['SLACK_TOKENS'];
let decrypted;
async function processEvent(event, context, callback) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 1);
    const https = require('https');
    const util = require('util');
    const slackTokens = decrypted
    const alert = event.Records[0].Sns
    const message = JSON.parse(alert.Message)
    const nameSpace = message.Trigger.Namespace
    const metricName = message.Trigger.MetricName
    const cloudwatchlogs = new AWS.CloudWatchLogs

    const metricParams = {
        metricName: metricName,
        metricNamespace: nameSpace
      };

    let metricFiltersLookup
    try {    
        metricFiltersLookup = await cloudwatchlogs.describeMetricFilters(metricParams).promise();
    }
    catch (err) {
        console.log(err);
    }

    const logGroupName = metricFiltersLookup.metricFilters[0].logGroupName

    const encodedFilter =  encodeURIComponent(encodeURIComponent(metricFiltersLookup.metricFilters[0].filterPattern));
    const searchURL = 'https://' + AWS.config.region + '.console.aws.amazon.com/cloudwatch/home?region=' + AWS.config.region + '#logEventViewer:group=' + logGroupName + ';filter=' + encodedFilter + ';start=' + startDate.toISOString() + ';end=' + endDate.toISOString()
    const postData = {
        "channel": "#errors",
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
            "text": "*" + alert.Subject + "*",
            "actions": [
                {
                  "type": "button",
                  "text": "View Events",
                  "url": searchURL
                }
            ]
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

    const emailList = process.env['EMAILS'].split(',');
    if ( typeof emailList !== 'undefined' || emailList !== null ) {
        const fromEmail = process.env['SENDER_ADDRESS']
        const fromName = process.env['SENDER_NAME']

        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
            </head>
            <body>
                <p>New Alert generated from AWS CloudWatch Logs.</p>
                <p>
                    <form action="` + searchURL + `">
                        <input type="submit" value="View Events" />
                    </form>
                </p>
            </body>
            </html>
        `;

        const textBody = `
            New Alert generated from AWS CloudWatch Logs.
            Click the link to view the events in the browser:` + searchURL;

        const emailParams = {
            Destination: {
            ToAddresses: emailList
            },
            Message: {
            Body: {
                Html: {
                Charset: "UTF-8",
                Data: htmlBody
                },
                Text: {
                Charset: "UTF-8",
                Data: textBody
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: alert.Subject
            }
            },
            Source: fromName + " <" + fromEmail + ">"
        };

        const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
        .sendEmail(emailParams)
        .promise();

        // Handle promise's fulfilled/rejected states
        sendPromise
        .then(data => {
            console.log(data.MessageId);
            context.done(null, "Success");
        })
            .catch(err => {
            console.error(err, err.stack);
            context.done(null, "Failed");
        });
    }
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
