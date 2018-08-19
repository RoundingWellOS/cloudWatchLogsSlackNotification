## CloudWatch Logs Slack Notitifation
A Lambda function to process SNS topics tied to CloudWatch Logs metric filter alarms and post to Slack. The slack message includes a button that links to the log group associated with the metric filter with the metric filter search parameters applied so you can view the relevant events that triggered the alarm.

Requires an encrypted environment variable set in Lambda `SLACK_TOKENS`.
See [the AWS documentation on encrypted variables](https://docs.aws.amazon.com/lambda/latest/dg/tutorial-env_console.html) for more details.

Supports email notifications with search link as well. To enable, add the following environment variables

`EMAILS` - The list of email addresses to send alerts to. **NOTE:** these addresses must be previously confirmed in SES
`SENDER_ADDRESS` - The email address that the alert will be from. This email must be previously confirmed in SES as well
`SENDER_NAME` - The display name of the sender. This is what will be displayed in the FROM portion of emails.

