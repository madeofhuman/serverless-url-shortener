import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateShortenedUrlRequest } from '@requests/CreateShortenedUrlRequest'
import { createShortenedUrl } from '@businessLogic/shortenedUrls'
import { createLogger } from '@utils/logger'
import { getToken } from '@functions/utils'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('createShortenedUrl')

export const handler = middy(
	async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
		logger.info('Processing createShortenedUrl Event: ', {
			event
		})

		const parsedBody: CreateShortenedUrlRequest = JSON.parse(event.body)
		const jwtToken = getToken(event)

		try {
			const item = await createShortenedUrl(jwtToken, parsedBody)
	
			logger.info('item created', item)
	
			return {
				statusCode: 201,
				body: JSON.stringify({
					item
				})
			}
		} catch (e) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					error: e.message
				})
			}
		}
	}
)

handler.use(
	cors({
		credentials: true,
		origin: '*'
	})
)
