// Netlify Function: DocuSign Maestro (JWT auth + trigger/embed/pause/resume)
// References:
// - https://developers.docusign.com/docs/maestro-api/auth/
// - https://developers.docusign.com/docs/maestro-api/how-to/trigger-workflow/
// - https://developers.docusign.com/docs/maestro-api/maestro101/embed-workflow/
// - https://developers.docusign.com/docs/maestro-api/how-to/pause-workflow/
// - https://developers.docusign.com/docs/maestro-api/how-to/resume-workflow/
// - https://github.com/docusign/sample-app-workflows-node

const docusign = require('docusign-esign')
const axios = require('axios')

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
}

function json(statusCode, body) {
    return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

function getEnv() {
    const {
        DOCUSIGN_ACCOUNT_ID,
        DOCUSIGN_USER_ID,
        DOCUSIGN_INTEGRATION_KEY,
        DOCUSIGN_IK,
        DOCUSIGN_RSA_PRIVATE_KEY,
        DOCUSIGN_RSA_PEM_AS_BASE64,
        DOCUSIGN_AUTH_SERVER,
        DOCUSIGN_OAUTH_BASE_PATH,
        DOCUSIGN_IAM_SCOPES,
        DOCUSIGN_MAESTRO_BASE_URL,
        DOCUSIGN_MAESTRO_WORKFLOW_ID,
    } = process.env

    const integrationKey = DOCUSIGN_IK || DOCUSIGN_INTEGRATION_KEY
    const oauthBasePath = DOCUSIGN_AUTH_SERVER || DOCUSIGN_OAUTH_BASE_PATH || 'account-d.docusign.com'

    let privateKeyPem = null
    if (DOCUSIGN_RSA_PEM_AS_BASE64) {
        try { privateKeyPem = Buffer.from(DOCUSIGN_RSA_PEM_AS_BASE64, 'base64').toString('utf8') } catch (_) { privateKeyPem = null }
    }
    if (!privateKeyPem && DOCUSIGN_RSA_PRIVATE_KEY) {
        privateKeyPem = DOCUSIGN_RSA_PRIVATE_KEY.replace(/\\n/g, '\n')
    }

    if (!DOCUSIGN_ACCOUNT_ID || !DOCUSIGN_USER_ID || !integrationKey || !privateKeyPem) {
        return { error: 'DocuSign environment variables missing' }
    }

    return {
        accountId: DOCUSIGN_ACCOUNT_ID,
        userId: DOCUSIGN_USER_ID,
        integrationKey,
        privateKey: privateKeyPem,
        oauthBasePath,
        maestroBaseUrl: DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.net/maestro/v1',
        workflowId: DOCUSIGN_MAESTRO_WORKFLOW_ID,
        scopes: String(DOCUSIGN_IAM_SCOPES || 'signature impersonation').split(/[ ,]+/).filter(Boolean),
    }
}

async function getJwtToken(scopes) {
    const cfg = getEnv()
    if (cfg.error) throw new Error(cfg.error)

    console.log('Getting JWT token with config:', {
        hasAccountId: !!cfg.accountId,
        hasUserId: !!cfg.userId,
        hasIntegrationKey: !!cfg.integrationKey,
        hasPrivateKey: !!cfg.privateKey,
        oauthBasePath: cfg.oauthBasePath,
        scopes: scopes || cfg.scopes
    })

    const apiClient = new docusign.ApiClient()
    apiClient.setOAuthBasePath(cfg.oauthBasePath)

    const jwtLifeSec = 3600
    const dsJWT = await apiClient.requestJWTUserToken(
        cfg.integrationKey,
        cfg.userId,
        scopes || cfg.scopes,
        Buffer.from(cfg.privateKey),
        jwtLifeSec
    )

    console.log('JWT token obtained successfully')
    return { accessToken: dsJWT.body.access_token, cfg }
}

function resolveWorkflowId(input) {
    try {
        const map = require('./config/maestro-workflows.json')
        if (!input) return map?.emprestimos || null
        // If input matches a UUID, use it directly; otherwise, use mapping key
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)
        if (isUuid) return input
        return map?.[String(input)] || null
    } catch (_) {
        return input || null
    }
}

async function maestroFetch(path, method, token, body) {
    const { maestroBaseUrl } = getEnv()
    const url = `${maestroBaseUrl}${path}`

    try {
        const response = await axios({
            method,
            url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: body,
        })
        return response.data
    } catch (error) {
        const status = error.response?.status || 500
        const message = error.response?.data || error.message || 'Unknown error'

        // Log the full error for debugging
        console.error('Maestro API error:', {
            status,
            message,
            url,
            method,
            headers: error.response?.headers,
            data: error.response?.data
        })

        throw new Error(`Maestro ${method} ${path} failed: ${status} ${JSON.stringify(message)}`)
    }
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return json(200, {})

    const method = event.httpMethod
    const path = (event.path || '').toLowerCase()

    try {
        // Diag
        if ((method === 'GET' || method === 'POST') && path.endsWith('/maestro/diag')) {
            const env = getEnv()
            const workflowMap = resolveWorkflowId('emprestimos')
            return json(200, {
                hasAccountId: !!env.accountId,
                hasWorkflowId: !!env.workflowId,
                oauthBasePath: env.oauthBasePath,
                maestroBaseUrl: env.maestroBaseUrl,
                workflowMap: workflowMap,
                envError: env.error
            })
        }

        // Test JWT auth only
        if ((method === 'GET' || method === 'POST') && path.endsWith('/maestro/test-auth')) {
            try {
                const { accessToken, cfg } = await getJwtToken(['signature', 'impersonation', 'aow_manage'])
                return json(200, {
                    success: true,
                    hasToken: !!accessToken,
                    tokenLength: accessToken?.length || 0,
                    accountId: cfg.accountId,
                    userId: cfg.userId
                })
            } catch (error) {
                return json(500, {
                    success: false,
                    error: error.message
                })
            }
        }

        // Get consent URL for Maestro
        if ((method === 'GET' || method === 'POST') && path.endsWith('/maestro/consent')) {
            try {
                const cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)

                const apiClient = new docusign.ApiClient()
                apiClient.setOAuthBasePath(cfg.oauthBasePath)

                // Generate consent URL for Maestro scopes
                const consentUrl = apiClient.getAuthorizationUri(
                    cfg.integrationKey,
                    ['signature', 'impersonation'],
                    'https://crispy-octo-spoon.netlify.app/maestro-consent-callback',
                    'code'
                )

                return json(200, {
                    consentUrl,
                    scopes: ['signature', 'impersonation'],
                    redirectUri: 'https://crispy-octo-spoon.netlify.app/maestro-consent-callback'
                })
            } catch (error) {
                return json(500, {
                    success: false,
                    error: error.message
                })
            }
        }

        // Exchange authorization code for access token
        if (method === 'POST' && path.endsWith('/maestro/token-exchange')) {
            try {
                let body = {}
                try { body = JSON.parse(event.body || '{}') } catch (_) { }

                const cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)

                // For JWT integration keys, we don't need OAuth2 code exchange
                // Instead, we'll generate a new JWT token after consent
                const { accessToken, expiresIn } = await getJwtToken(['signature', 'impersonation', 'aow_manage'])

                return json(200, {
                    success: true,
                    accessToken: accessToken,
                    tokenType: 'Bearer',
                    expiresIn: expiresIn || 3600
                })
            } catch (error) {
                console.error('Token generation error:', error.message)
                return json(500, {
                    success: false,
                    error: error.message
                })
            }
        }

        // Trigger workflow instance
        if (method === 'POST' && path.endsWith('/maestro/trigger')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }

            console.log('Trigger request body:', body)

            // Check if Authorization header is provided (from stored token)
            const auth = event.headers.authorization || event.headers.Authorization
            let accessToken = null
            let cfg = null

            if (auth?.startsWith('Bearer ')) {
                // Use provided token
                accessToken = auth.slice(7)
                cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)
            } else {
                // Generate JWT token
                const jwtResult = await getJwtToken(['signature', 'impersonation', 'aow_manage'])
                accessToken = jwtResult.accessToken
                cfg = jwtResult.cfg
            }

            const workflowId = resolveWorkflowId(body.workflow || body.workflowKey || body.workflowId || cfg.workflowId)

            console.log('Resolved workflowId:', workflowId)
            if (!workflowId) throw new Error('Missing workflowId')

            // Per docs, POST /workflows/{workflowId}/instances
            const startRequest = {
                // Optional: inputs, metadata, callbackUrl, etc.
                inputs: body.inputs || {},
            }
            console.log('Starting workflow with request:', startRequest)
            const data = await maestroFetch(`/workflows/${workflowId}/instances`, 'POST', accessToken, startRequest)
            console.log('Workflow started, response:', data)
            return json(200, { instanceId: data?.instanceId || data?.id || null, data })
        }

        // Get embedded URL for an instance
        if ((method === 'GET' || method === 'POST') && path.endsWith('/maestro/embed')) {
            let params = {}
            if (method === 'GET') {
                const search = new URL(event.rawUrl || `http://x${event.path}${event.rawQuery ? '?' + event.rawQuery : ''}`)
                params = Object.fromEntries(search.searchParams.entries())
            } else {
                try { params = JSON.parse(event.body || '{}') } catch (_) { }
            }

            const { accessToken } = await getJwtToken(['signature', 'impersonation', 'aow_manage'])
            const instanceId = params.instanceId
            if (!instanceId) throw new Error('Missing instanceId')

            // Per docs, GET /workflows/instances/{instanceId}/embeddedUrl
            const data = await maestroFetch(`/workflows/instances/${instanceId}/embeddedUrl`, 'GET', accessToken)
            return json(200, { url: data?.url || data?.embeddedUrl || null, data })
        }

        // Pause instance
        if (method === 'POST' && path.endsWith('/maestro/pause')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }
            const { accessToken } = await getJwtToken(['signature', 'impersonation', 'aow_manage'])
            if (!body.instanceId) throw new Error('Missing instanceId')
            const data = await maestroFetch(`/workflows/instances/${body.instanceId}/pause`, 'POST', accessToken, {})
            return json(200, { success: true, data })
        }

        // Resume instance
        if (method === 'POST' && path.endsWith('/maestro/resume')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }
            const { accessToken } = await getJwtToken(['signature', 'impersonation', 'maestro'])
            if (!body.instanceId) throw new Error('Missing instanceId')
            const data = await maestroFetch(`/workflows/instances/${body.instanceId}/resume`, 'POST', accessToken, {})
            return json(200, { success: true, data })
        }

        return json(404, { error: 'Not Found' })
    } catch (err) {
        console.error('Maestro error:', err)
        const message = err.response?.body || err.message || 'Unknown error'
        return json(500, { error: 'MaestroError', message })
    }
}


