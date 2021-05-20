import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '@utils/logger'
import { getShortenedUrls } from '@businessLogic/shortenedUrls'
import { getToken } from '@functions/utils'

const logger = createLogger('getTodos')

export const handler = middy(
	async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
		logger.info('Processing getTodos Event: ', {
			event
		})

		const jwtToken = getToken(event)
		const items = await getShortenedUrls(jwtToken)

		return {
			statusCode: 200,
			body: JSON.stringify({
				items
			})
		}
	}
)

handler.use(
	cors({
		credentials: true,
		origin: '*'
	})
)
