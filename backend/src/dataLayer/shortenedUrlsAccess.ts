import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ShortenedUrlItem } from '@models/ShortenedUrlItem'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('shortenedUrlsAccess')

export class ShortenedUrlAccess {
	constructor(
		private readonly docClient: DocumentClient = createDynamoDBClient(),
		private readonly shortenedUrlsTable = process.env.SHORTENED_URLS_TABLE,
	) {}

  /**
   * 
   * @param shortenedUrl 
   * @returns ShortenedUrlItem
   */
	async createShortenedUrl(shortenedUrl: ShortenedUrlItem): Promise<ShortenedUrlItem> {
		await this.docClient
			.put({
				TableName: this.shortenedUrlsTable,
				Item: shortenedUrl
			})
			.promise()

		return shortenedUrl
	}

	/**
	 * 
	 * @param userId 
	 * @returns 
	 */
	async getShortenedUrls(userId: string): Promise<ShortenedUrlItem[]> {
		const result = await this.docClient
			.query({
				TableName: this.shortenedUrlsTable,
				KeyConditionExpression: 'userId = :userId',
				ExpressionAttributeValues: {
					':userId': userId
				}
			})
			.promise()

		logger.info('Query result:', result)

		const items = result.Items
		return items as ShortenedUrlItem[]
	}
}

function createDynamoDBClient(): AWS.DynamoDB.DocumentClient {
	if (process.env.IS_OFFLINE) {
		logger.info('Using local DynamoDB instance')
		return new XAWS.DynamoDB.DocumentClient({
			region: 'localhost',
			endpoint: 'http://localhost:8000'
		})
	}

	return new XAWS.DynamoDB.DocumentClient()
}
