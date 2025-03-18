const { MongoClient, ClientEncryption } = require('mongodb');
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_IV_LENGTH = 16;

// Sensitive fields configuration
const SENSITIVE_FIELDS = {
  users: ['email', 'name'],
  events: ['eventId', 'description'],
  images: ['metadata']
};

// Encrypt a field value
const encryptField = (value) => {
  if (!value) return value;
  
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

// Decrypt a field value
const decryptField = (encryptedData) => {
  if (!encryptedData || !encryptedData.encrypted) return encryptedData;
  
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Process document for encryption/decryption
const processDocument = (document, collection, operation) => {
  if (!document) return document;
  
  const sensitiveFields = SENSITIVE_FIELDS[collection] || [];
  const processedDoc = { ...document };
  
  sensitiveFields.forEach(field => {
    if (field in processedDoc) {
      if (operation === 'encrypt') {
        processedDoc[field] = encryptField(processedDoc[field]);
      } else if (operation === 'decrypt') {
        processedDoc[field] = decryptField(processedDoc[field]);
      }
    }
  });
  
  return processedDoc;
};

// Middleware for automatic encryption/decryption
const encryptionMiddleware = (collection) => {
  return async (req, res, next) => {
    // Encrypt sensitive fields before saving
    if (req.method === 'POST' || req.method === 'PUT') {
      req.body = processDocument(req.body, collection, 'encrypt');
    }
    
    // Decrypt sensitive fields after retrieving
    const originalJson = res.json;
    res.json = function(data) {
      if (Array.isArray(data)) {
        data = data.map(doc => processDocument(doc, collection, 'decrypt'));
      } else {
        data = processDocument(data, collection, 'decrypt');
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  encryptField,
  decryptField,
  processDocument,
  encryptionMiddleware
}; 