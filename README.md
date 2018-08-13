## CloudWatch Logs Slack Notitifation
A Lambda function to process SNS topics tied to CloudWatch Logs metric filter alarms and post to Slack.

Requires an encrypted environment variable set in Lambda `SLACK_TOKENS`.
See [the AWS documentation on encrypted variables](https://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html) for more details.

Also, be sure to update the line `AWS.config.update({ region: 'us-west-2' });` to match your Lambda AWS region.

Additionally, When setting up your Metric Filters, makes sure that the metric namespace matches the name of your log-group as we're using the filter Namespace from the alerts to build links to the log group for further details.
