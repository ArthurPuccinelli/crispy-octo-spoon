const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'change-me-dev-secret';
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID || 'your-client-id';
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || 'your-client-secret';
const AUTHORIZATION_CODE = process.env.AUTHORIZATION_CODE || 'mock-auth-code';

const dbDir = path.join(__dirname, '../../db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const accountFile = path.join(dbDir, 'Account.json');
if (!fs.existsSync(accountFile)) {
    fs.writeFileSync(accountFile, JSON.stringify([], null, 2));
}

function readJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content || '[]');
    } catch (e) {
        return [];
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- OAuth Mock ---
router.get('/oauth/authorize', (req, res) => {
    const { client_id } = req.query;
    if (client_id !== OAUTH_CLIENT_ID) {
        return res.status(400).json({ error: 'invalid_client' });
    }
    // Simula consent screen redirect with code
    return res.json({ code: AUTHORIZATION_CODE });
});

router.post('/oauth/token', (req, res) => {
    const { grant_type, code, client_id, client_secret } = req.body || {};
    if (grant_type !== 'authorization_code' || code !== AUTHORIZATION_CODE) {
        return res.status(400).json({ error: 'invalid_grant' });
    }
    if (client_id !== OAUTH_CLIENT_ID || client_secret !== OAUTH_CLIENT_SECRET) {
        return res.status(400).json({ error: 'invalid_client' });
    }
    const accessToken = jwt.sign({ sub: client_id }, JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ access_token: accessToken, token_type: 'Bearer', expires_in: 3600 });
});

// Middleware simples para validar Bearer token
router.use((req, res, next) => {
    if (req.path.startsWith('/oauth')) return next();
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if (!token) return res.status(401).json({ error: 'missing_token' });
    try {
        jwt.verify(token, JWT_SECRET_KEY);
        next();
    } catch (e) {
        return res.status(401).json({ error: 'invalid_token' });
    }
});

// --- Data IO Actions ---
// CreateRecord
router.post('/actions/create', (req, res) => {
    const { typeName, data } = req.body || {};
    if (typeName !== 'Account') return res.status(400).json({ error: 'Unsupported typeName' });
    const db = readJson(accountFile);
    const newId = String(db.length + 1);
    const record = { Id: newId, ...data };
    db.push(record);
    writeJson(accountFile, db);
    res.json({ id: newId });
});

// SearchRecords (simplified IQuery mapping)
router.post('/actions/search', (req, res) => {
    const { query } = req.body || {};
    if (!query || query.from !== 'Account') {
        return res.status(400).json({ error: 'Unsupported query.from' });
    }
    const db = readJson(accountFile);
    const op = query.queryFilter && query.queryFilter.operation;
    if (!op) return res.json({ results: [] });
    const left = op.leftOperand;
    const right = op.rightOperand;
    const operator = op.operator;
    if (!left || !right || operator !== 'EQUALS') return res.json({ results: [] });
    const needle = left.name;
    const field = right.name;
    const results = db.filter(r => String(r[field]) === String(needle));
    res.json({ results });
});

// PatchRecord
router.post('/actions/patch', (req, res) => {
    const { recordId, typeName, data } = req.body || {};
    if (typeName !== 'Account') return res.status(400).json({ error: 'Unsupported typeName' });
    const db = readJson(accountFile);
    const index = db.findIndex(r => String(r.Id) === String(recordId));
    if (index === -1) return res.status(404).json({ error: 'Record not found' });
    db[index] = { ...db[index], ...data };
    writeJson(accountFile, db);
    res.json({ success: true });
});

module.exports = router;


