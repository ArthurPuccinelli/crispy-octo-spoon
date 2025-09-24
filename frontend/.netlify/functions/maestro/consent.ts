import type { Handler } from '@netlify/functions'

// Build consent URL for DocuSign (user authorization for the integration key)
const handler: Handler = async (event) => {
    try {
        if (event.httpMethod !== 'GET') {
            return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) }
        }

        const authServer = process.env.DOCUSIGN_AUTH_SERVER || process.env.DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com'
        const integrationKey = process.env.DOCUSIGN_IK || ''
        const scopesFromEnv = process.env.DOCUSIGN_IAM_SCOPES || 'signature aow_manage'

        // Build redirect URI from the current request host if not provided in env
        const proto = (event.headers['x-forwarded-proto'] || 'https') as string
        const host = (event.headers['x-forwarded-host'] || event.headers.host || '').toString()
        const fallbackRedirect = host ? `${proto}://${host}/maestro-consent-callback` : 'https://example.com/maestro-consent-callback'
        const redirectUri = fallbackRedirect

        if (!integrationKey) {
            return { statusCode: 500, body: JSON.stringify({ message: 'Missing DOCUSIGN_INTEGRATION_KEY' }) }
        }

        // Consent URL for JWT apps requires signature scope and Maestro aow_manage
        const scopes = encodeURIComponent(scopesFromEnv)
        const consentUrl = `${authServer}/oauth/auth?response_type=code&scope=${scopes}&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(redirectUri)}`

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consentUrl })
        }
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message || 'Internal error' }) }
    }
}

export { handler }


