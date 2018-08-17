## CloudWatch Logs Slack Notitifation
A Lambda function to process SNS topics tied to CloudWatch Logs metric filter alarms and post to Slack. The slack message includes a button that links to the log group associated with the metric filter with the metric filter search parameters applied so you can view the relevant events that triggered the alarm.

Requires an encrypted environment variable set in Lambda `SLACK_TOKENS`.
See [the AWS documentation on encrypted variables](https://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html) for more details.
