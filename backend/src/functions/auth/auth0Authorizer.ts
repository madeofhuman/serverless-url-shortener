import { CustomAuthorizerResult } from 'aws-lambda'
import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'
import { createLogger } from '@utils/logger'
import { Jwt } from '@auth/Jwt'
import { JwtPayload } from '@auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://madeofhuman.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: { authorizationToken: string }
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  const jwtKid = jwt.header.kid
	let cert: string | Buffer

  try {
		const jwks = await Axios.get(jwksUrl)
		const signing = jwks.data.keys.filter((k: { kid: string }) => k.kid === jwtKid)[0]

		logger.info('signInKey', signing)

		if (!signing) {
			throw new Error(`Unable to find matching signing key for '${jwtKid}'`)
		}

		const { x5c } = signing

		cert = `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`
	} catch (error) {
		logger.error('Error getting certificate : ', error)
	}

	return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
