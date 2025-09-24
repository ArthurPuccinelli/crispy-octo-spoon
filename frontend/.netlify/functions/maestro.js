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

        // Get consent URL for JWT (simplified)
        if ((method === 'GET' || method === 'POST') && path.endsWith('/maestro/consent')) {
            try {
                const cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)

                // For JWT integration keys, use the consent URL directly
                const consentUrl = `https://${cfg.oauthBasePath}/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${cfg.integrationKey}&redirect_uri=https://crispy-octo-spoon.netlify.app/maestro-consent-callback`

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

        // Exchange authorization code for access token (OAuth2 flow)
        if (method === 'POST' && path.endsWith('/maestro/token-exchange')) {
            try {
                let body = {}
                try { body = JSON.parse(event.body || '{}') } catch (_) { }

                const cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)

                // Exchange authorization code for access token
                const tokenUrl = `https://${cfg.oauthBasePath}/oauth/token`

                const formData = new URLSearchParams()
                formData.append('grant_type', 'authorization_code')
                formData.append('code', body.code)
                formData.append('client_id', cfg.integrationKey)
                formData.append('redirect_uri', 'https://crispy-octo-spoon.netlify.app/maestro-consent-callback')

                const tokenResponse = await axios.post(tokenUrl, formData, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    }
                })

                return json(200, {
                    success: true,
                    accessToken: tokenResponse.data.access_token,
                    tokenType: tokenResponse.data.token_type,
                    expiresIn: tokenResponse.data.expires_in,
                    refreshToken: tokenResponse.data.refresh_token
                })
            } catch (error) {
                console.error('Token exchange error:', error.response?.data || error.message)
                return json(500, {
                    success: false,
                    error: error.response?.data?.error_description || error.message
                })
            }
        }

        // Trigger workflow instance
        if (method === 'POST' && path.endsWith('/maestro/trigger')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }

            console.log('Trigger request body:', body)
            
            // Check if Authorization header is provided (OAuth2 token)
            const auth = event.headers.authorization || event.headers.Authorization
            let accessToken = null
            let cfg = null
            
            if (auth?.startsWith('Bearer ')) {
                // Use provided OAuth2 token
                accessToken = auth.slice(7)
                cfg = getEnv()
                if (cfg.error) throw new Error(cfg.error)
            } else {
                // Try JWT with Maestro scopes
                try {
                    const jwtResult = await getJwtToken(['signature', 'impersonation', 'aow_manage'])
                    accessToken = jwtResult.accessToken
                    cfg = jwtResult.cfg
                } catch (jwtError) {
                    console.log('JWT failed, need consent:', jwtError.message)
                    // JWT failed, need consent
                    return json(401, { error: 'consent_required', message: 'User consent required for Maestro API' })
                }
            }
            
            const workflowId = resolveWorkflowId(body.workflow || body.workflowKey || body.workflowId || cfg.workflowId)
            
            console.log('Resolved workflowId:', workflowId)
            if (!workflowId) throw new Error('Missing workflowId')

            // Step 1: Get workflow details to obtain triggerURL
            console.log('Getting workflow details...')
            const workflowDetails = await maestroFetch(`/workflows/${workflowId}`, 'GET', accessToken)
            console.log('Workflow details:', workflowDetails)
            
            if (!workflowDetails || !workflowDetails.triggerUrl) {
                throw new Error('Workflow triggerUrl not found')
            }
            
            // Step 2: Build request body with starting variables
            const startRequest = {
                startingVariables: body.inputs || {},
                participants: body.participants || [],
                metadata: body.metadata || {}
            }
            console.log('Starting workflow with request:', startRequest)
            
            // Step 3: POST to the specific triggerURL
            const triggerResponse = await axios.post(workflowDetails.triggerUrl, startRequest, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            
            console.log('Workflow triggered, response:', triggerResponse.data)
            
            // Step 4: Verify response and return instance details
            const responseData = triggerResponse.data
            if (!responseData) {
                throw new Error('No response from workflow trigger')
            }
            
            return json(200, { 
                instanceId: responseData.instanceId || responseData.id || null, 
                status: responseData.status,
                triggerUrl: workflowDetails.triggerUrl,
                data: responseData 
            })
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


