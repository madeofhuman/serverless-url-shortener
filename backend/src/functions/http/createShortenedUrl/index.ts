import schema from './schema'
import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/createShortenedUrl.handler`,
  events: [
    {
      http: {
        method: 'post',
        path: 'shorten',
        cors: true,
        authorizer: 'Auth',
        request: {
          schemas: {
            'application/json': schema
          }
        }
      }
    }
  ],
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: [
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
      ],
      Resource: [
        {"Fn::GetAtt": [ 'ShortenedUrlsDynamoDBTable', 'Arn' ]},
      ],
    }
  ]
}
