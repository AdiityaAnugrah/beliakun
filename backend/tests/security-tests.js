#!/usr/bin/env node

/**
 * Comprehensive Security Tests for Phase 1 & 2 Improvements
 * 
 * Tests:
 * 1. Rate Limiting
 * 2. Input Validation
 * 3. Security Headers
 * 4. JWT Authentication
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:4000';
const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

let testsPassed = 0;
let testsFailed = 0;

// Helper functions
function log(message, color = 'reset') {
    console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logTest(name, passed, details = '') {
    if (passed) {
        log(`✅ ${name}`, 'green');
        testsPassed++;
    } else {
        log(`❌ ${name}`, 'red');
        if (details) log(`   ${details}`, 'yellow');
        testsFailed++;
    }
}

async function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = (url.protocol === 'https:' ? https : http).request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data ? JSON.parse(data) : null
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Rate Limiting
async function testRateLimiting() {
    log('\n📊 Testing Rate Limiting...', 'cyan');
    
    // Test auth login rate limit (5/15min)
    log('\n  Testing login rate limit (5 attempts / 15 min)...');
    const loginAttempts = [];
    for (let i = 0; i < 6; i++) {
        const res = await makeRequest('/auth/login', 'POST', {
            email: 'test@test.com',
            password: 'wrongpassword'
        });
        loginAttempts.push(res.status);
        await sleep(100); // Small delay between requests
    }
    
    const blockedOnSixth = loginAttempts[5] === 429;
    logTest(
        'Login rate limit blocks 6th attempt',
        blockedOnSixth,
        blockedOnSixth ? '' : `Expected 429, got ${loginAttempts[5]}`
    );

    // Check rate limit headers
    const rateLimitTest = await makeRequest('/auth/login', 'POST', {
        email: 'test2@test.com',
        password: 'test'
    });
    const hasRateLimitHeaders = 
        rateLimitTest.headers['ratelimit-limit'] !== undefined ||
        rateLimitTest.headers['x-ratelimit-limit'] !== undefined;
    
    logTest(
        'Rate limit headers present',
        hasRateLimitHeaders,
        'Headers: ' + Object.keys(rateLimitTest.headers).filter(h => h.includes('rate')).join(', ')
    );
}

// Test 2: Input Validation
async function testInputValidation() {
    log('\n🔍 Testing Input Validation...', 'cyan');
    
    // Test weak password
    const weakPasswordTest = await makeRequest('/auth/signup', 'POST', {
        email: 'test@example.com',
        password: 'weak',
        nama: 'Test User',
        username: 'testuser',
        captchaToken: 'test'
    });
    
    const rejectsWeakPassword = weakPasswordTest.status === 400 &&
        weakPasswordTest.body?.error === 'Validation failed';
    logTest(
        'Rejects weak password',
        rejectsWeakPassword,
        rejectsWeakPassword ? '' : `Got status ${weakPasswordTest.status}`
    );

    // Test invalid email
    const invalidEmailTest = await makeRequest('/auth/signup', 'POST', {
        email: 'not-an-email',
        password: 'ValidPass123',
        nama: 'Test',
        username: 'test',
        captchaToken: 'test'
    });
    
    const rejectsInvalidEmail = invalidEmailTest.status === 400;
    logTest('Rejects invalid email format', rejectsInvalidEmail);

    // Test non-alphanumeric username
    const invalidUsernameTest = await makeRequest('/auth/signup', 'POST', {
        email: 'test@test.com',
        password: 'ValidPass123',
        nama: 'Test',
        username: 'test@user!',
        captchaToken: 'test'
    });
    
    const rejectsInvalidUsername = invalidUsernameTest.status === 400;
    logTest('Rejects non-alphanumeric username', rejectsInvalidUsername);

    // Test missing required fields
    const missingFieldsTest = await makeRequest('/auth/login', 'POST', {
        email: 'test@test.com'
        // password missing
    });
    
    const rejectsMissingFields = missingFieldsTest.status === 400;
    logTest('Rejects missing required fields', rejectsMissingFields);
}

// Test 3: Security Headers
async function testSecurityHeaders() {
    log('\n🛡️  Testing Security Headers...', 'cyan');
    
    const res = await makeRequest('/');
    const headers = res.headers;
    
    // Helmet headers
    logTest('Has X-Content-Type-Options header', headers['x-content-type-options'] === 'nosniff');
    logTest('Has X-Frame-Options header', !!headers['x-frame-options']);
    logTest('Has Content-Security-Policy header', !!headers['content-security-policy']);
    
    // CORS headers
    const corsTest = await makeRequest('/', 'GET', null, { 
        'Origin': 'http://localhost:5173'
    });
    logTest('CORS headers present', !!corsTest.headers['access-control-allow-origin']);
}

// Test 4: JWT Authentication
async function testJWTAuth() {
    log('\n🔐 Testing JWT Authentication...', 'cyan');
    
    // Test protected route without token
    const noTokenTest = await makeRequest('/product');
    // This might be a public route, let's test a truly protected one
    
    // Try to access a protected endpoint
    const protectedTest = await makeRequest('/wishlist');
    const requiresAuth = protectedTest.status === 401 || protectedTest.status === 403;
    logTest(
        'Protected routes require authentication',
        requiresAuth,
        requiresAuth ? '' : `Status: ${protectedTest.status}`
    );
}

// Test 5: Logging
async function testLogging() {
    log('\n📝 Testing Logging Infrastructure...', 'cyan');
    
    const fs = require('fs');
    const path = require('path');
    
    const logsDir = path.join(__dirname, '../logs');
    
    // Check if logs directory exists
    const logsDirExists = fs.existsSync(logsDir);
    logTest('Logs directory exists', logsDirExists);
    
    if (logsDirExists) {
        // Check log files
        const combinedLogExists = fs.existsSync(path.join(logsDir, 'combined.log'));
        const errorLogExists = fs.existsSync(path.join(logsDir, 'error.log'));
        const securityLogExists = fs.existsSync(path.join(logsDir, 'security.log'));
        
        logTest('combined.log exists', combinedLogExists);
        logTest('error.log exists', errorLogExists);
        logTest('security.log exists', securityLogExists);
        
        // Check if logs are being written (file size > 0)
        if (combinedLogExists) {
            const stats = fs.statSync(path.join(logsDir, 'combined.log'));
            logTest('Logs are being written', stats.size > 0);
        }
    }
}

// Main test runner
async function runTests() {
    log('\n' + '='.repeat(60), 'cyan');
    log('     🧪 SECURITY TESTS - Phase 1 & 2 Improvements', 'bold');
    log('='.repeat(60) + '\n', 'cyan');
    
    try {
        await testRateLimiting();
        await testInputValidation();
        await testSecurityHeaders();
        await testJWTAuth();
        await testLogging();
        
        // Summary
        log('\n' + '='.repeat(60), 'cyan');
        log('     📊 TEST SUMMARY', 'bold');
        log('='.repeat(60), 'cyan');
        log(`✅ Passed: ${testsPassed}`, 'green');
        log(`❌ Failed: ${testsFailed}`, 'red');
        log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 'yellow');
        log('='.repeat(60) + '\n', 'cyan');
        
        process.exit(testsFailed > 0 ? 1 : 0);
    } catch (error) {
        log(`\n❌ Test runner error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run tests
runTests();
