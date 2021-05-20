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
		private readonly indexName = process.env.SHORTENED_URLS_TABLE_INDEX_NAME,
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

	async deleteShortenedUrl(userId: string, shortenedUrlId: string) {
		let result = {
			statusCode: 200,
			body: ''
		}

		let shortenedUrlToBeDeleted = await this.docClient
			.query({
				TableName: this.shortenedUrlsTable,
				KeyConditionExpression: 'userId = :userId AND shortenedUrlId = :shortenedUrlId',
				ExpressionAttributeValues: {
					':userId': userId,
					':shortenedUrlId': shortenedUrlId
				}
			})
			.promise()

		if (shortenedUrlToBeDeleted.Items.length === 0) {
			result.statusCode = 404
			result.body = 'No shortened url item to be deleted'
			return result
		}

		await this.docClient
			.delete({
				TableName: this.shortenedUrlsTable,
				Key: {
					userId,
					shortenedUrlId
				}
			})
			.promise()

		return result
	}

	async getShortenedUrl(userId: string, shortenedUrlId: string) {
		let result = {
			statusCode: 200,
			body: ''
		}

		const queryResult = await this.docClient
			.query({
				TableName: this.shortenedUrlsTable,
				KeyConditionExpression: 'userId = :userId AND shortenedUrlId = :shortenedUrlId',
				ExpressionAttributeValues: {
					':userId': userId,
					':shortenedUrlId': shortenedUrlId
				}
			})
			.promise()

		if (queryResult.Items.length === 0) {
			result.statusCode = 404
			result.body = JSON.stringify({ 'error': 'No shortened url with given id found' })
			return result
		}

		logger.info('Query result:', queryResult)
		result.body = JSON.stringify(queryResult.Items[0])

		return result;
	}

	async getLongUrl(shortUrl: string) {
		let result = {
			statusCode: 301,
			body: '',
			headers: {}
		}

		const queryResult = await this.docClient
			.query({
				TableName: this.shortenedUrlsTable,
				IndexName: this.indexName,
				KeyConditionExpression: 'shortUrl = :shortUrl',
				ExpressionAttributeValues: {
					':shortUrl': shortUrl
				},
				ScanIndexForward: false
			})
			.promise()

		if (queryResult.Items.length === 0) {
			result.statusCode = 404
			result.body = JSON.stringify({ 'error': 'No such short url found' })
			return result
		}

		logger.info('Query result:', queryResult)
		result.headers = { Location: queryResult.Items[0].longUrl }

		return result;
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
