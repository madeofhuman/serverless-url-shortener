import { handlerPath } from '@libs/handlerResolver'

export default {
  handler: `${handlerPath(__dirname)}/getLongUrl.handler`,
  events: [
    {
      http: {
        method: 'get',
        path: '{shortUrlHash}',
        cors: true,
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
        {
          "Fn::Join": [
            "/",
            [
              {"Fn::GetAtt": [ 'ShortenedUrlsDynamoDBTable', 'Arn' ]},
              "index",
              "longUrlIndex",
            ],
          ]
        },
      ],
    },
  ]
}
