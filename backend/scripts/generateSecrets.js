#!/usr/bin/env node

/**
 * JWT Secret Generator
 * 
 * Run this script to generate cryptographically secure secrets for JWT
 * 
 * Usage:
 *   node scripts/generateSecrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 JWT Secret Generator\n');
console.log('='repeat(50));
console.log('\nGenerating cryptographically secure 256-bit secrets...\n');

// Generate 256-bit (32 bytes) random secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ JWT_SECRET (for access tokens):');
console.log(`   ${jwtSecret}\n`);

console.log('✅ REFRESH_SECRET (for refresh tokens):');
console.log(`   ${refreshSecret}\n`);

console.log('='repeat(50));
console.log('\n📝 Instructions:\n');
console.log('1. Copy these secrets to your .env file');
console.log('2. Replace the existing JWT_SECRET and REFRESH_SECRET values');
console.log('3. NEVER commit these secrets to git');
console.log('4. Rotate secrets regularly (monthly recommended)');
console.log('5. Use DIFFERENT secrets for development and production\n');

console.log('⚠️  IMPORTANT:\n');
console.log('   - Old tokens will become invalid after changing secrets');
console.log('   - All users will need to log in again');
console.log('   - Plan the rotation during low-traffic periods\n');
