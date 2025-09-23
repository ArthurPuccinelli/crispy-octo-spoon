// Netlify Function: DocuSign JWT Auth + Envelope Creation
// Endpoints:
//  - POST /.netlify/functions/docusign-actions/auth -> obtém access_token via JWT Grant
//  - POST /.netlify/functions/docusign-actions/envelopes -> cria envelope (send or create)
//  - GET  /.netlify/functions/docusign-actions/diag -> diagnóstico de ambiente (sem segredos)

const docusign = require('docusign-esign')

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
}

function json(statusCode, body) {
    return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) }
}

// Variáveis de ambiente necessárias
function getEnv() {
    const {
        DOCUSIGN_ACCOUNT_ID,
        DOCUSIGN_USER_ID,
        DOCUSIGN_INTEGRATION_KEY,
        DOCUSIGN_IK,
        DOCUSIGN_RSA_PRIVATE_KEY,
        DOCUSIGN_RSA_PEM_AS_BASE64,
        DOCUSIGN_OAUTH_BASE_PATH,
        DOCUSIGN_AUTH_SERVER,
        DOCUSIGN_BASE_PATH,
        DOCUSIGN_IAM_SCOPES,
    } = process.env

    const integrationKey = DOCUSIGN_IK || DOCUSIGN_INTEGRATION_KEY
    const oauthBasePath = DOCUSIGN_AUTH_SERVER || DOCUSIGN_BASE_PATH || DOCUSIGN_OAUTH_BASE_PATH || 'account-d.docusign.com'

    let privateKeyPem = null
    if (DOCUSIGN_RSA_PEM_AS_BASE64) {
        try {
            privateKeyPem = Buffer.from(DOCUSIGN_RSA_PEM_AS_BASE64, 'base64').toString('utf8')
        } catch (_) {
            privateKeyPem = null
        }
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
        scopes: Array.isArray(DOCUSIGN_IAM_SCOPES)
            ? DOCUSIGN_IAM_SCOPES
            : String(DOCUSIGN_IAM_SCOPES || 'signature,impersonation').split(/[ ,]+/).filter(Boolean),
    }
}

async function getJwtToken(scopes) {
    const cfg = getEnv()
    if (cfg.error) throw new Error(cfg.error)

    const apiClient = new docusign.ApiClient()
    apiClient.setOAuthBasePath(cfg.oauthBasePath)

    const jwtLifeSec = 3600
    const dsJWT = await apiClient.requestJWTUserToken(
        cfg.integrationKey,
        cfg.userId,
        scopes || cfg.scopes || ['signature', 'impersonation'],
        Buffer.from(cfg.privateKey),
        jwtLifeSec
    )

    const accessToken = dsJWT.body.access_token
    const expiresIn = dsJWT.body.expires_in
    return { accessToken, expiresIn, cfg }
}

async function createEnvelope(accessToken, cfg, payload) {
    const {
        emailSubject = 'Assinatura eletrônica',
        status = 'sent', // or 'created'
        recipients = { signers: [] },
        documents = [], // [{ name, fileExtension, base64 }]
        emailBlurb,
    } = payload || {}

    if (!Array.isArray(documents) || documents.length === 0) {
        throw new Error('documents array is required')
    }
    if (!recipients?.signers || recipients.signers.length === 0) {
        throw new Error('at least one signer is required')
    }

    const apiClient = new docusign.ApiClient()
    apiClient.setOAuthBasePath(cfg.oauthBasePath)
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`)

    // Descobrir baseUri correto da conta e configurar basePath da API REST
    const userInfo = await apiClient.getUserInfo(accessToken)
    const targetAccount = userInfo?.accounts?.find(a => a.accountId === cfg.accountId) || userInfo?.accounts?.[0]
    if (!targetAccount || !targetAccount.baseUri) {
        throw new Error('Unable to resolve account baseUri from DocuSign user info')
    }
    apiClient.setBasePath(`${targetAccount.baseUri}/restapi`)

    const envelopesApi = new docusign.EnvelopesApi(apiClient)

    const dsDocs = documents.map((doc, idx) => ({
        documentBase64: doc.base64,
        name: doc.name || `Documento-${idx + 1}`,
        fileExtension: doc.fileExtension || 'pdf',
        documentId: String(idx + 1),
    }))

    const dsSigners = recipients.signers.map((s, idx) => ({
        email: s.email,
        name: s.name,
        recipientId: String(idx + 1),
        routingOrder: String(s.routingOrder || idx + 1),
        tabs: s.tabs || undefined, // permitir tabs pré-montadas
    }))

    const envelopeDefinition = new docusign.EnvelopeDefinition()
    envelopeDefinition.emailSubject = emailSubject
    if (emailBlurb) envelopeDefinition.emailBlurb = emailBlurb
    envelopeDefinition.documents = dsDocs
    envelopeDefinition.recipients = { signers: dsSigners }
    envelopeDefinition.status = status // 'created' para salvar rascunho, 'sent' para enviar

    const results = await envelopesApi.createEnvelope(cfg.accountId, { envelopeDefinition })
    return results
}

exports.handler = async (event) => {
    // CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return json(200, {})
    }

    const path = (event.path || '').toLowerCase()
    const method = event.httpMethod

    try {
        // Diagnóstico de ambiente (não vaza segredos)
        if ((method === 'GET' || method === 'POST') && path.endsWith('/docusign-actions/diag')) {
            const env = getEnv()
            const result = {
                hasAccountId: !!process.env.DOCUSIGN_ACCOUNT_ID,
                hasUserId: !!process.env.DOCUSIGN_USER_ID,
                hasIntegrationKey: !!(process.env.DOCUSIGN_IK || process.env.DOCUSIGN_INTEGRATION_KEY),
                hasPrivateKey: !!(process.env.DOCUSIGN_RSA_PEM_AS_BASE64 || process.env.DOCUSIGN_RSA_PRIVATE_KEY),
                oauthBasePath: process.env.DOCUSIGN_AUTH_SERVER || process.env.DOCUSIGN_BASE_PATH || process.env.DOCUSIGN_OAUTH_BASE_PATH || 'account-d.docusign.com',
                scopes: env.scopes,
                parsedEnvValid: !env.error,
            }
            return json(200, result)
        }
        if (method === 'POST' && path.endsWith('/docusign-actions/auth')) {
            const { accessToken, expiresIn, cfg } = await getJwtToken()
            return json(200, {
                access_token: accessToken,
                token_type: 'Bearer',
                expires_in: expiresIn,
                accountId: cfg.accountId,
                oauthBasePath: cfg.oauthBasePath,
            })
        }

        if (method === 'POST' && path.endsWith('/docusign-actions/envelopes')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }

            // Token pode ser enviado pelo cliente para reuso ou será gerado aqui
            const auth = event.headers.authorization || event.headers.Authorization
            let token = null
            if (auth?.startsWith('Bearer ')) token = auth.slice(7)

            const { accessToken, cfg } = token
                ? { accessToken: token, cfg: getEnv() }
                : await getJwtToken()

            if (cfg.error) throw new Error(cfg.error)

            const result = await createEnvelope(accessToken, cfg, body)
            return json(200, { envelopeId: result.envelopeId, status: result.status })
        }

        return json(404, { error: 'Not Found' })
    } catch (err) {
        console.error('DocuSign action error:', err)
        const message = err.response?.body || err.message || 'Unknown error'
        return json(500, { error: 'DocuSignError', message })
    }
}


