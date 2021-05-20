import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/getShortenedUrl.handler`,
  events: [
    {
      http: {
        method: 'get',
        path: 'shortenedUrls/{shortenedUrlId}',
        cors: true,
        authorizer: 'Auth',
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:Query',
      ],
      Resource: [
        {"Fn::GetAtt": [ 'ShortenedUrlsDynamoDBTable', 'Arn' ]},
      ],
    },
  ]
}
