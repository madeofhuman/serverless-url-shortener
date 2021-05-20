import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '@utils/logger'
import { deleteShortenedUrl } from '@businessLogic/shortenedUrls'
import { getToken } from '@functions/utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('deleteShortenedUrl')

export const handler = middy(
	async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
		const shortenedUrlId = event.pathParameters.shortenedUrlId

		logger.info('Deleting shortened url: ', {
			event
		})

		const jwtToken = getToken(event)
		const result = await deleteShortenedUrl(jwtToken, shortenedUrlId)

		return {
			statusCode: result.statusCode,
			body: result.body
		}
	}
)

handler.use(
	cors({
		credentials: true,
    origin: '*'
	})
)
