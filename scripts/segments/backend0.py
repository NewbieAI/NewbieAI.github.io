def lambda_handler(event, context):
    try:
        sns = boto3.client("sns")
        response = sns.publish(
            TopicArn = "arn:aws:sns:[region]:[id]:[topic]",
            Message = event["body"],
        )
        return {
            "statusCode": 200,
        }
    except:
        return {
            "statusCode": 500,
            "body": "Server Failed To Send Message",
        }
