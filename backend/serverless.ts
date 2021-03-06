import type { AWS } from '@serverless/typescript';

import Auth from '@functions/auth';
import createShortenedUrl from '@functions/http/createShortenedUrl';
import getShortenedUrls from '@functions/http/getShortenedUrls';
import deleteShortenedUrl from '@functions/http/deleteShortenedUrl';
import getShortenedUrl from '@functions/http/getShortenedUrl';
import getLongUrl from '@functions/http/getLongUrl';

const serverlessConfiguration: AWS = {
  service: 'serverless-url-shortener',
  configValidationMode: 'error',
  frameworkVersion: '2',
  variablesResolutionMode: '20210326',
  disabledDeprecations: [
    'CLI_OPTIONS_SCHEMA',
    'UNSUPPORTED_CLI_OPTIONS'
  ],
  plugins: [
    'serverless-iam-roles-per-function',
    'serverless-offline',
    'serverless-dynamodb-local',
    'serverless-dotenv-plugin',
    'serverless-bundle',
  ],
  package: {
    individually: true
  },
  custom: {
    ['serverless-offline']: {
      httpPort: 3003,
      babelOptions: {
        presets: ["env"]
      }
    },
    dynamodb: {
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
      stages: ["${self:custom.stage}"]
    },
    stage: "${opt:stage, 'dev'}",
    region: "${opt:region, 'eu-west-2'}",
  },
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    lambdaHashingVersion: '20201221',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SHORTENED_URLS_TABLE: '${self:service}-ShortenedUrls-${self:custom.stage}',
      SHORTENED_URLS_TABLE_INDEX_NAME: 'longUrlIndex',
      API_ID: 'xgc8h3gbw0'
    },
    tracing: {
      lambda: true,
      apiGateway: true,
    }
  },
  functions: {
    Auth,
    createShortenedUrl,
    getShortenedUrls,
    deleteShortenedUrl,
    getShortenedUrl,
    getLongUrl,
  },
  resources: {
    Resources: {
      ShortenedUrlsDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.SHORTENED_URLS_TABLE}',
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'shortenedUrlId', AttributeType: 'S' },
            { AttributeName: 'shortUrl', AttributeType: 'S' }
          ],
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'shortenedUrlId', KeyType: 'RANGE' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: '${self:provider.environment.SHORTENED_URLS_TABLE_INDEX_NAME}',
              KeySchema: [
                { AttributeName: 'shortUrl', KeyType: 'HASH' },
              ],
              Projection: {
                ProjectionType: 'ALL'
              }
            }
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }
      },
      GatewayResponseDefault4XX: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            ['gatewayresponse.header.Access-Control-Allow-Origin']: "'*'",
            ['gatewayresponse.header.Access-Control-Allow-Headers']: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            ['gatewayresponse.header.Access-Control-Allow-Methods']: "'GET,OPTIONS,POST'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: "ApiGatewayRestApi"
          }
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;
