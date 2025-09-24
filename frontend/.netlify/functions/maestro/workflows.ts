import type { Handler } from '@netlify/functions'
import jwt from 'jsonwebtoken'

const now = () => Math.floor(Date.now() / 1000)

export const handler: Handler = async () => {
    try {
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
            return { statusCode: 401, body: JSON.stringify(tokenData) }
        }
        const accessToken = tokenData.access_token as string

        const rawMaestroBase = DOCUSIGN_MAESTRO_BASE_URL || 'https://api-d.docusign.com/v1'
        const maestroBase = rawMaestroBase.endsWith('/v1') ? rawMaestroBase : (rawMaestroBase.endsWith('/') ? `${rawMaestroBase}v1` : `${rawMaestroBase}/v1`)
        const listUrl = `${maestroBase}/accounts/${DOCUSIGN_ACCOUNT_ID}/workflows?status=active`
        const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
        const listData = await listResp.json().catch(() => ({}))
        if (!listResp.ok) {
            return { statusCode: listResp.status, body: JSON.stringify({ message: 'Failed to list workflows', listUrl, data: listData }) }
        }

        const simplified = Array.isArray(listData?.items)
            ? listData.items.map((w: any) => ({ id: w?.id || w?.workflowId, name: w?.name, status: w?.status, triggerUrl: w?.url || w?.triggerUrl || w?.links?.trigger }))
            : listData

        return { statusCode: 200, body: JSON.stringify({ accountId: DOCUSIGN_ACCOUNT_ID, maestroBase, listUrl, items: simplified }) }
    } catch (e: any) {
        return { statusCode: 500, body: JSON.stringify({ message: e?.message || 'Internal error' }) }
    }
}


