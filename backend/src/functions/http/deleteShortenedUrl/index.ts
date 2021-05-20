import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/deleteShortenedUrl.handler`,
  events: [
    {
      http: {
        method: 'delete',
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
        'dynamodb:DeleteItem',
      ],
      Resource: [
        {"Fn::GetAtt": [ 'ShortenedUrlsDynamoDBTable', 'Arn' ]},
      ],
    },
  ]
}
