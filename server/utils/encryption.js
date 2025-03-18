const { MongoClient, ClientEncryption } = require('mongodb');
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-min-32-chars-long!!';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Sensitive fields configuration
const SENSITIVE_FIELDS = {
  users: ['email', 'name'],
  events: ['eventId', 'description'],
  images: ['metadata']
};

// Encrypt a field value
const encryptField = (value) => {
  if (!value) return value;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(value);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt a field value
const decryptField = (encryptedData) => {
  if (!encryptedData) return encryptedData;
  
  const textParts = encryptedData.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
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
  encryptionMiddleware,
  encryptFields: encryptField,
  decryptFields: decryptField
}; 