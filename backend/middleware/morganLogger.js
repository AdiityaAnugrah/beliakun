// middleware/morganLogger.js
const morgan = require('morgan');
const logger = require('../config/logger');

// Create custom Morgan token for response time in ms
morgan.token('response-time-ms', (req, res) => {
    if (!req._startAt || !res._startAt) {
        return '-';
    }
    
    const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
               (res._startAt[1] - req._startAt[1]) * 1e-6;
    
    return ms.toFixed(2);
});

// Custom Morgan stream that writes to Winston
const stream = {
    write: (message) => {
        // Remove trailing newline
        logger.http(message.trim());
    },
};

// Morgan format for production (minimal, no sensitive data)
const productionFormat = ':remote-addr :method :url :status :response-time-ms ms';

// Morgan format for development (detailed)
const developmentFormat = ':method :url :status :response-time-ms ms - :res[content-length]';

// Choose format based on environment
const format = process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat;

// Create Morgan middleware
const morganMiddleware = morgan(format, {
    stream,
    skip: (req, res) => {
        // Skip logging health check endpoints to reduce noise
        return req.url === '/health' || req.url === '/ping';
    },
});

module.exports = morganMiddleware;
