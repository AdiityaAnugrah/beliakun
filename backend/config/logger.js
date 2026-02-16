// config/logger.js
const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format (pretty print for development)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Define transports
const transports = [
    // Console logging (all levels in development, error only in production)
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    }),
    
    // Error log file (only errors)
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    
    // Combined log file (all levels)
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    
    // Security events log file
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/security.log'),
        level: 'warn',
        format,
        maxsize: 5242880, // 5MB
        maxFiles: 10, // Keep more security logs
    }),
];

// Create logger instance
const logger = winston.createLogger({
    levels,
    format,
    transports,
    exitOnError: false,
});

// Helper functions for common log scenarios
logger.logSecurity = (message, metadata = {}) => {
    logger.warn(message, { type: 'security', ...metadata });
};

logger.logAuth = (action, email, success, metadata = {}) => {
    const level = success ? 'info' : 'warn';
    logger.log(level, `Auth ${action}: ${email}`, {
        type: 'authentication',
        action,
        email,
        success,
        ...metadata
    });
};

logger.logError = (err, req = null) => {
    const errorInfo = {
        message: err.message,
        stack: err.stack,
        type: 'application_error',
    };
    
    if (req) {
        errorInfo.url = req.originalUrl;
        errorInfo.method = req.method;
        errorInfo.ip = req.ip;
        errorInfo.userAgent = req.get('user-agent');
    }
    
    logger.error(err.message, errorInfo);
};

module.exports = logger;
