// middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * STRICT rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
        error: "Too many authentication attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    // Skip successful requests (count only failures)
    skipSuccessfulRequests: false,
    // Use IP + endpoint for tracking
    keyGenerator: (req) => {
        return req.ip + "-" + req.path;
    },
});

/**
 * MODERATE rate limiter for AI chat endpoints
 * Prevents API quota exhaustion
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        error: "Too many AI requests. Please slow down.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * GENERAL rate limiter for API endpoints
 * Basic protection against DoS
 */
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * STRICT limiter for email verification
 * Prevents code brute forcing
 */
const verifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 attempts per 5 minutes
    message: {
        error: "Too many verification attempts. Please wait 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Track by IP + email
        return req.ip + "-" + (req.body.email || "unknown");
    },
});

module.exports = {
    authLimiter,
    aiLimiter,
    generalLimiter,
    verifyLimiter,
};
