import * as uuid from 'uuid'
import { ShortenedUrlItem } from '@models/ShortenedUrlItem'
import { ShortenedUrlAccess } from '@dataLayer/shortenedUrlsAccess'
import { parseUserId } from '@auth/utils'
import { CreateShortenedUrlRequest } from '@requests/CreateShortenedUrlRequest'
import { createLogger } from '@utils/logger'

const logger = createLogger('shortenedUrls')

const shortenedUrlAccess = new ShortenedUrlAccess()

const apiId = process.env.API_ID
const apiEndpoint = process.env.IS_OFFLINE ? 'http://localhost:3003/dev' : `https://${apiId}.execute-api.eu-west-2.amazonaws.com/dev`

/**
 * 
 * @param jwtToken 
 * @param parsedBody 
 * @returns 
 */
export async function createShortenedUrl(
	jwtToken: string,
	parsedBody: CreateShortenedUrlRequest
) {
	const longUrl = validateUrl(parsedBody.longUrl);
	const userId = parseUserId(jwtToken)
	const shortenedUrlId = uuid.v4()
	const shortUrl = `${apiEndpoint}/${Math.random().toString(32).substring(2, 6) + Math.random().toString(32).substring(2, 6)}`

	logger.info('userId', userId)
	logger.info('shortenedUrlId', shortenedUrlId)

	const item: ShortenedUrlItem = {
		userId,
		shortenedUrlId,
		createdAt: new Date().toISOString(),
		longUrl,
		shortUrl,
	}

	logger.info('Item to be created at business logic', item)
	const toReturn = shortenedUrlAccess.createShortenedUrl(item)

	return toReturn
}

/**
 * 
 * @param jwtToken 
 * @returns 
 */
export async function getShortenedUrls(
	jwtToken: string
): Promise<ShortenedUrlItem[]> {
	const userId = parseUserId(jwtToken)

	return shortenedUrlAccess.getShortenedUrls(userId)
}

/**
 * 
 * @param jwtToken 
 * @param shortenedUrlId 
 * @returns 
 */
export async function deleteShortenedUrl(
	jwtToken: string,
	shortenedUrlId: string
) {
	const userId = parseUserId(jwtToken)
	const toReturn = shortenedUrlAccess.deleteShortenedUrl(userId, shortenedUrlId)

	return toReturn
}

/**
 * 
 * @param jwtToken 
 * @param shortenedUrlId 
 * @returns 
 */
 export async function getShortenedUrl(
	 jwtToken: string,
	 shortenedUrlId: string
) {
	const userId = parseUserId(jwtToken)
	const toReturn = shortenedUrlAccess.getShortenedUrl(userId, shortenedUrlId)

	return toReturn
}

/**
 * 
 * @param shortUrlHash 
 * @returns 
 */
 export async function getLongUrl(shortUrlHash: string) {
	const shortUrl = `${apiEndpoint}/${shortUrlHash}`
	const toReturn = shortenedUrlAccess.getLongUrl(shortUrl)

	return toReturn
}

/**
 * 
 * @param url The URL to validate
 * @returns the valid URL
 * @throws error when url is invalid
 */
function validateUrl(url: string) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  
	if (pattern.test(url)) {
		return url
	}

	throw new Error('Invalid URL supplied.')
}
