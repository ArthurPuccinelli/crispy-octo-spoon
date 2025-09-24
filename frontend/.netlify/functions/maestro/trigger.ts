import type { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'

type TriggerBody = {
    workflowId?: string
    workflowKey?: string
    instanceName?: string
    inputs?: Record<string, unknown>
}

const nowInSeconds = () => Math.floor(Date.now() / 1000)

const handler: Handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) }
        }

        const {
            DOCUSIGN_AUTH_SERVER,
            DOCUSIGN_BASE_PATH,
            DOCUSIGN_ACCOUNT_ID,
            DOCUSIGN_IK,
            DOCUSIGN_USER_ID,
            DOCUSIGN_RSA_PEM_AS_BASE64,
            DOCUSIGN_MAESTRO_BASE_URL,
            DOCUSIGN_IAM_SCOPES
        } = process.env as Record<string, string | undefined>

        if (!DOCUSIGN_ACCOUNT_ID || !DOCUSIGN_IK || !DOCUSIGN_USER_ID || !DOCUSIGN_RSA_PEM_AS_BASE64) {
            return { statusCode: 500, body: JSON.stringify({ message: 'Missing DocuSign env vars' }) }
        }

        const body = (event.body ? JSON.parse(event.body) : {}) as TriggerBody
        const workflowId = body.workflowId || '97d9fa9e-f938-4099-a1d2-22b74ee954c5'
        const instanceName = body.instanceName || `Fontara Emprestimos - ${new Date().toISOString()}`
        const inputs = body.inputs || {}

        if (!workflowId) {
            return { statusCode: 400, body: JSON.stringify({ message: 'workflowId not provided' }) }
        }

        // Create JWT for DocuSign (user consent must be granted beforehand)
        const jwtPayload = {
            iss: DOCUSIGN_IK,
            sub: DOCUSIGN_USER_ID,
            aud: new URL(DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com').host,
            iat: nowInSeconds(),
            exp: nowInSeconds() + 600,
            scope: DOCUSIGN_IAM_SCOPES || 'signature aow_manage'
        }
        const privateKey = Buffer.from(DOCUSIGN_RSA_PEM_AS_BASE64, 'base64').toString('utf8')
        const assertion = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' })

        // Exchange JWT for access token
        const tokenResp = await fetch(`${DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com'}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
        })
        const tokenData = await tokenResp.json().catch(() => ({}))

        if (!tokenResp.ok) {
            // If consent is required, DocuSign returns error: consent_required
            if (tokenData?.error === 'consent_required') {
                return { statusCode: 400, body: JSON.stringify({ error: 'consent_required' }) }
            }
            return { statusCode: 401, body: JSON.stringify({ message: tokenData?.error_description || 'Failed to get access token' }) }
        }

        const accessToken = tokenData.access_token as string

        // Trigger Maestro workflow instance
        const maestroBase = DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1'
        const triggerResp = await fetch(`${maestroBase}/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows/${workflowId}/instances`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ instanceName, triggerInputs: inputs })
        })
        const triggerData = await triggerResp.json().catch(() => ({}))

        if (!triggerResp.ok) {
            return { statusCode: triggerResp.status, body: JSON.stringify({ message: triggerData }) }
        }

        // Harmonize fields
        const instanceId = triggerData.instanceId || triggerData.id
        const workflowInstanceUrl = triggerData.workflowInstanceUrl || triggerData.instanceUrl

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instanceId, workflowInstanceUrl, data: triggerData })
        }
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message || 'Internal error' }) }
    }
}

export { handler }


