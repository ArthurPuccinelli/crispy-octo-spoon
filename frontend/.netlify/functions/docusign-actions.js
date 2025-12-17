// Netlify Function: DocuSign JWT Auth + Envelope Creation
// Endpoints:
//  - POST /.netlify/functions/docusign-actions/auth -> obtém access_token via JWT Grant
//  - POST /.netlify/functions/docusign-actions/envelopes -> cria envelope (send or create)
//  - GET  /.netlify/functions/docusign-actions/diag -> diagnóstico de ambiente (sem segredos)
//  - GET  /.netlify/functions/docusign-actions/envelopes/{envelopeId}/audit_events -> busca audit events do envelope
//  - GET  /.netlify/functions/docusign-actions/envelopes/{envelopeId}/idevidence -> busca ID Evidence events e media

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
        clientUserId: s.clientUserId || undefined, // necessário para embedded signing
        tabs: s.tabs || undefined, // permitir tabs pré-montadas
        // Forward advanced signature and delivery options when provided by the client
        recipientSignatureProviders: s.recipientSignatureProviders || undefined,
        deliveryMethod: s.deliveryMethod || undefined,
        phoneNumber: s.phoneNumber || undefined,
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

async function createEmbeddedEnvelope(accessToken, cfg, envelopeId, returnUrl, signer) {
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

    // Criar recipient view para embed
    const recipientViewRequest = new docusign.RecipientViewRequest()
    recipientViewRequest.authenticationMethod = 'none'
    recipientViewRequest.returnUrl = returnUrl || 'https://example.com'
    // DocuSign Embedded Signing requires clientUserId to match signer in the envelope
    recipientViewRequest.clientUserId = signer?.clientUserId || '1'
    recipientViewRequest.userName = signer?.userName || signer?.name || 'Signer Teste'
    recipientViewRequest.email = signer?.email || 'signer@example.com'

    const results = await envelopesApi.createRecipientView(cfg.accountId, envelopeId, {
        recipientViewRequest
    })

    return results
}

async function getEnvelopeAuditEvents(accessToken, cfg, envelopeId) {
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

    // Buscar audit events do envelope
    const results = await envelopesApi.listAuditEvents(cfg.accountId, envelopeId)
    return results
}

async function getEnvelopeRecipients(accessToken, cfg, envelopeId) {
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

    // Buscar recipients do envelope
    const results = await envelopesApi.listRecipients(cfg.accountId, envelopeId)
    return results
}

async function getIdentityProofToken(accessToken, cfg, envelopeId, recipientIdGuid) {
    const apiClient = new docusign.ApiClient()
    apiClient.setOAuthBasePath(cfg.oauthBasePath)
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`)

    // Descobrir baseUri correto da conta e configurar basePath da API REST
    const userInfo = await apiClient.getUserInfo(accessToken)
    const targetAccount = userInfo?.accounts?.find(a => a.accountId === cfg.accountId) || userInfo?.accounts?.[0]
    if (!targetAccount || !targetAccount.baseUri) {
        throw new Error('Unable to resolve account baseUri from DocuSign user info')
    }
    const baseUri = targetAccount.baseUri

    // Gerar resource token para ID Evidence
    // POST /v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients/{recipientIdGuid}/identity_proof_token
    const url = `${baseUri}/restapi/v2.1/accounts/${cfg.accountId}/envelopes/${envelopeId}/recipients/${recipientIdGuid}/identity_proof_token`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get identity proof token: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data
}

async function getIDEvidenceEvents(proofBaseURI, resourceToken, recipientIdGuid) {
    // GET {proofBaseURI}/api/v1/events/person/{recipientIdGuid}.json
    const url = `${proofBaseURI}/api/v1/events/person/${recipientIdGuid}.json`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${resourceToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        // Se retornar 404, pode ser que não há eventos de ID Evidence
        if (response.status === 404) {
            return { events: [] }
        }
        const errorText = await response.text()
        throw new Error(`Failed to get ID Evidence events: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data
}

async function getIDEvidenceMedia(proofBaseURI, resourceToken, recipientIdGuid, eventId) {
    // GET {proofBaseURI}/api/v1/media/person/{recipientIdGuid}/event/{eventId}
    const url = `${proofBaseURI}/api/v1/media/person/${recipientIdGuid}/event/${eventId}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${resourceToken}`,
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get ID Evidence media: ${response.status} ${errorText}`)
    }

    // Retornar como buffer/base64
    const buffer = Buffer.from(await response.arrayBuffer())
    const base64 = buffer.toString('base64')
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return {
        base64,
        contentType,
        size: buffer.length,
    }
}

async function getAllIDEvidenceData(accessToken, cfg, envelopeId) {
    try {
        // 1. Buscar recipients do envelope
        const recipientsResult = await getEnvelopeRecipients(accessToken, cfg, envelopeId)
        const recipients = recipientsResult.signers || []

        if (recipients.length === 0) {
            return { events: [], media: [] }
        }

        // 2. Para cada recipient, buscar eventos de ID Evidence
        const allEvents = []
        const allMedia = []

        for (const recipient of recipients) {
            const recipientIdGuid = recipient.recipientIdGuid
            if (!recipientIdGuid) continue

            try {
                // 3. Gerar resource token
                const tokenResult = await getIdentityProofToken(accessToken, cfg, envelopeId, recipientIdGuid)
                const { resourceToken, proofBaseURI } = tokenResult

                if (!resourceToken || !proofBaseURI) continue

                // 4. Buscar eventos
                const eventsData = await getIDEvidenceEvents(proofBaseURI, resourceToken, recipientIdGuid)
                const events = eventsData.events || eventsData || []

                // Adicionar informações do recipient aos eventos
                const eventsWithRecipient = events.map(event => ({
                    ...event,
                    recipientIdGuid,
                    recipientName: recipient.name,
                    recipientEmail: recipient.email,
                }))

                allEvents.push(...eventsWithRecipient)

                // 5. Buscar mídia para cada evento que tenha ID
                for (const event of events) {
                    if (event.id || event.eventId) {
                        try {
                            const eventId = event.id || event.eventId
                            const media = await getIDEvidenceMedia(proofBaseURI, resourceToken, recipientIdGuid, eventId)
                            allMedia.push({
                                eventId,
                                recipientIdGuid,
                                recipientName: recipient.name,
                                recipientEmail: recipient.email,
                                ...media,
                            })
                        } catch (mediaError) {
                            // Ignorar erros de mídia individual
                            console.log(`Media not available for event ${event.id || event.eventId}:`, mediaError.message)
                        }
                    }
                }
            } catch (recipientError) {
                // Se não houver ID Evidence para este recipient, continuar
                console.log(`No ID Evidence for recipient ${recipientIdGuid}:`, recipientError.message)
            }
        }

        return {
            events: allEvents,
            media: allMedia,
        }
    } catch (error) {
        // Se não houver ID Evidence habilitado, retornar vazio
        if (error.message && error.message.includes('404')) {
            return { events: [], media: [] }
        }
        throw error
    }
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

        if (method === 'POST' && path.endsWith('/docusign-actions/envelopes/embed')) {
            let body = {}
            try { body = JSON.parse(event.body || '{}') } catch (_) { }

            const { envelopeId, returnUrl, signer } = body
            if (!envelopeId) {
                return json(400, { error: 'envelopeId is required' })
            }

            // Token pode ser enviado pelo cliente para reuso ou será gerado aqui
            const auth = event.headers.authorization || event.headers.Authorization
            let token = null
            if (auth?.startsWith('Bearer ')) token = auth.slice(7)

            const { accessToken, cfg } = token
                ? { accessToken: token, cfg: getEnv() }
                : await getJwtToken()

            if (cfg.error) throw new Error(cfg.error)

            const result = await createEmbeddedEnvelope(accessToken, cfg, envelopeId, returnUrl, signer)
            return json(200, { url: result.url })
        }

        // Buscar audit events do envelope
        // GET /.netlify/functions/docusign-actions/envelopes/{envelopeId}/audit_events
        const originalPath = event.path || ''
        if (method === 'GET' && path.includes('/docusign-actions/envelopes/') && path.endsWith('/audit_events')) {
            const pathParts = originalPath.split('/')
            const envelopeIdIndex = pathParts.indexOf('envelopes') + 1
            const envelopeId = pathParts[envelopeIdIndex]

            if (!envelopeId || envelopeId === 'audit_events') {
                return json(400, { error: 'envelopeId is required in the path' })
            }

            // Token pode ser enviado pelo cliente para reuso ou será gerado aqui
            const auth = event.headers.authorization || event.headers.Authorization
            let token = null
            if (auth?.startsWith('Bearer ')) token = auth.slice(7)

            const { accessToken, cfg } = token
                ? { accessToken: token, cfg: getEnv() }
                : await getJwtToken()

            if (cfg.error) throw new Error(cfg.error)

            const result = await getEnvelopeAuditEvents(accessToken, cfg, envelopeId)
            // Garantir que retornamos a estrutura correta
            // O SDK pode retornar o objeto diretamente ou como propriedade
            const auditEvents = result.auditEvents || result.body?.auditEvents || result
            return json(200, { auditEvents: auditEvents || [] })
        }

        // Buscar ID Evidence events e media
        // GET /.netlify/functions/docusign-actions/envelopes/{envelopeId}/idevidence
        if (method === 'GET' && path.includes('/docusign-actions/envelopes/') && path.endsWith('/idevidence')) {
            const pathParts = originalPath.split('/')
            const envelopeIdIndex = pathParts.indexOf('envelopes') + 1
            const envelopeId = pathParts[envelopeIdIndex]

            if (!envelopeId || envelopeId === 'idevidence') {
                return json(400, { error: 'envelopeId is required in the path' })
            }

            // Token pode ser enviado pelo cliente para reuso ou será gerado aqui
            const auth = event.headers.authorization || event.headers.Authorization
            let token = null
            if (auth?.startsWith('Bearer ')) token = auth.slice(7)

            let accessToken, cfg
            if (token) {
                cfg = getEnv()
                if (cfg.error) {
                    return json(500, {
                        error: 'DocuSignError',
                        message: cfg.error
                    })
                }
                accessToken = token
            } else {
                try {
                    const tokenResult = await getJwtToken()
                    accessToken = tokenResult.accessToken
                    cfg = tokenResult.cfg
                    if (cfg.error) {
                        return json(500, {
                            error: 'DocuSignError',
                            message: cfg.error
                        })
                    }
                } catch (tokenError) {
                    return json(500, {
                        error: 'DocuSignError',
                        message: tokenError.message || 'Erro ao obter token JWT'
                    })
                }
            }

            try {
                const result = await getAllIDEvidenceData(accessToken, cfg, envelopeId)
                return json(200, result)
            } catch (error) {
                // Se não houver ID Evidence habilitado, retornar vazio
                if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
                    return json(200, { events: [], media: [] })
                }
                throw error
            }
        }

        return json(404, { error: 'Not Found' })
    } catch (err) {
        console.error('DocuSign action error:', err)
        const message = err.response?.body || err.message || 'Unknown error'
        return json(500, { error: 'DocuSignError', message })
    }
}


