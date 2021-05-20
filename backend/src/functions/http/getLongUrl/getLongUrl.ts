import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '@utils/logger'
import { getLongUrl } from '@businessLogic/shortenedUrls'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('getLongUrl')

export const handler = middy(
	async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
		const shortUrlHash = event.pathParameters.shortUrlHash

		logger.info('Getting long url: ', {
			event
		})

		const result = await getLongUrl(shortUrlHash)

		return {
			statusCode: result.statusCode,
			body: result.body,
      headers: result.headers
		}
	}
)

handler.use(
	cors({
		credentials: true,
    origin: '*'
	})
)
