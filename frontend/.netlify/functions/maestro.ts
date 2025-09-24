import type { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'

type TriggerBody = {
    action?: 'trigger'
    instanceName?: string
    inputs?: Record<string, unknown>
}

const now = () => Math.floor(Date.now() / 1000)

const getAccessToken = async () => {
    const {
        DOCUSIGN_AUTH_SERVER,
        DOCUSIGN_BASE_PATH,
        DOCUSIGN_IK,
        DOCUSIGN_USER_ID,
        DOCUSIGN_IAM_SCOPES,
        DOCUSIGN_RSA_PEM_AS_BASE64
    } = process.env as Record<string, string | undefined>

    if (!DOCUSIGN_IK || !DOCUSIGN_USER_ID || !DOCUSIGN_RSA_PEM_AS_BASE64) {
        throw new Error('Missing DocuSign env vars')
    }

    const payload = {
        iss: DOCUSIGN_IK,
        sub: DOCUSIGN_USER_ID,
        aud: new URL(DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com').host,
        iat: now(),
        exp: now() + 600,
        scope: DOCUSIGN_IAM_SCOPES || 'signature aow_manage'
    }
    const privateKey = Buffer.from(DOCUSIGN_RSA_PEM_AS_BASE64, 'base64').toString('utf8')
    const assertion = jwt.sign(payload, privateKey, { algorithm: 'RS256' })

    const tokenResp = await fetch(`${DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com'}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })
    })
    const tokenData = await tokenResp.json().catch(() => ({}))
    if (!tokenResp.ok) {
        if (tokenData?.error === 'consent_required') {
            return { error: 'consent_required' } as const
        }
        throw new Error(tokenData?.error_description || 'Failed to get access token')
    }
    return { accessToken: tokenData.access_token as string } as const
}

const handler: Handler = async (event) => {
    try {
        const url = new URL(event.rawUrl)
        const action = (event.httpMethod === 'GET' ? url.searchParams.get('action') : undefined) || (event.httpMethod === 'POST' ? (JSON.parse(event.body || '{}') as TriggerBody).action : undefined) || ''

        if (event.httpMethod === 'GET' && action === 'consent') {
            const authServer = process.env.DOCUSIGN_AUTH_SERVER || process.env.DOCUSIGN_BASE_PATH || 'https://account-d.docusign.com'
            const integrationKey = process.env.DOCUSIGN_IK || ''
            const scopesFromEnv = process.env.DOCUSIGN_IAM_SCOPES || 'signature aow_manage'
            const proto = (event.headers['x-forwarded-proto'] || 'https') as string
            const host = (event.headers['x-forwarded-host'] || event.headers.host || '').toString()
            const redirectUri = host ? `${proto}://${host}/maestro-consent-callback` : 'https://example.com/maestro-consent-callback'
            if (!integrationKey) return { statusCode: 500, body: JSON.stringify({ message: 'Missing DOCUSIGN_IK' }) }
            const scopes = encodeURIComponent(scopesFromEnv)
            const consentUrl = `${authServer}/oauth/auth?response_type=code&scope=${scopes}&client_id=${integrationKey}&redirect_uri=${encodeURIComponent(redirectUri)}`
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ consentUrl }) }
        }

        const isDiagnose = event.httpMethod === 'GET' && url.searchParams.get('diagnose') === '1'
        if (event.httpMethod !== 'POST' && !isDiagnose) {
            return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) }
        }

        const {
            DOCUSIGN_MAESTRO_BASE_URL,
            DOCUSIGN_ACCOUNT_ID
        } = process.env as Record<string, string | undefined>

        if (!DOCUSIGN_ACCOUNT_ID) {
            return { statusCode: 500, body: JSON.stringify({ message: 'Missing DOCUSIGN_ACCOUNT_ID' }) }
        }

        const token = await getAccessToken()
        if ('error' in token && token.error === 'consent_required') {
            return { statusCode: 400, body: JSON.stringify({ error: 'consent_required' }) }
        }
        const accessToken = token.accessToken

        const rawMaestroBase = DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1'
        const maestroBase = rawMaestroBase.endsWith('/v1') ? rawMaestroBase : (rawMaestroBase.endsWith('/') ? `${rawMaestroBase}v1` : `${rawMaestroBase}/v1`)

        // Diagnose: list workflows
        let listUrl: string | undefined
        let knownWorkflowIds: string[] | undefined
        listUrl = `${maestroBase}/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows?status=active`
        const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
        const listData = await listResp.json().catch(() => ({}))
        if (listResp.ok && Array.isArray(listData?.items)) {
            knownWorkflowIds = listData.items.map((w: any) => w?.id || w?.workflowId).filter(Boolean)
        }
        if (isDiagnose) {
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ diagnostics: { accountId: DOCUSIGN_ACCOUNT_ID, maestroBase, listUrl, knownWorkflowIds } }) }
        }

        // Trigger path
        const body = (event.body ? JSON.parse(event.body) : {}) as TriggerBody
        const workflowId = '97d9fa9e-f938-4099-a1d2-22b74ee954c5'
        const instanceName = body.instanceName || `Fontara Emprestimos - ${new Date().toISOString()}`
        const inputs = body.inputs || {}

        // Try to find triggerUrl in list
        let triggerUrl: string | undefined
        if (Array.isArray(listData?.items)) {
            const wf = listData.items.find((w: any) => w?.id === workflowId || w?.workflowId === workflowId)
            triggerUrl = wf?.url || wf?.triggerUrl || wf?.triggerURL || wf?.links?.trigger || undefined
        }

        let triggerResp: Response
        let fallbackUrl: string | undefined
        if (triggerUrl) {
            triggerResp = await fetch(triggerUrl, {
                method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceName, triggerInputs: inputs })
            })
        } else {
            fallbackUrl = `${maestroBase}/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows/${workflowId}/instances`
            triggerResp = await fetch(fallbackUrl, {
                method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ instanceName, triggerInputs: inputs })
            })
        }

        const rawText = await triggerResp.text()
        let triggerData: any = {}
        try { triggerData = JSON.parse(rawText) } catch { triggerData = { raw: rawText } }
        if (!triggerResp.ok) {
            const message = triggerData?.message || triggerData?.error || triggerData?.raw || 'Failed to trigger workflow'
            return { statusCode: triggerResp.status, body: JSON.stringify({ message, diagnostics: { accountId: DOCUSIGN_ACCOUNT_ID, maestroBase, listUrl, knownWorkflowIds, triggerUrl, fallbackUrl } }) }
        }

        const instanceId = triggerData.instanceId || triggerData.id
        const workflowInstanceUrl = triggerData.workflowInstanceUrl || triggerData.instanceUrl || triggerData.url
        if (!workflowInstanceUrl) {
            return { statusCode: 500, body: JSON.stringify({ message: 'Workflow triggerUrl not found', diagnostics: { accountId: DOCUSIGN_ACCOUNT_ID, maestroBase, listUrl, knownWorkflowIds } }) }
        }

        return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instanceId, workflowInstanceUrl, data: triggerData }) }
    } catch (error: any) {
        const {
            DOCUSIGN_ACCOUNT_ID,
            DOCUSIGN_MAESTRO_BASE_URL,
            DOCUSIGN_AUTH_SERVER,
            DOCUSIGN_BASE_PATH
        } = process.env as Record<string, string | undefined>
        const rawMaestroBase = DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1'
        const maestroBase = rawMaestroBase.endsWith('/v1') ? rawMaestroBase : (rawMaestroBase.endsWith('/') ? `${rawMaestroBase}v1` : `${rawMaestroBase}/v1`)
        return { statusCode: 500, body: JSON.stringify({ message: error?.message || 'Internal error', diagnostics: { accountId: DOCUSIGN_ACCOUNT_ID, maestroBase, authServer: DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH } }) }
    }
}

export { handler }


