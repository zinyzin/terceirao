// src/lib/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

if (process.env.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.JWT_ACCESS_SECRET) missing.push('JWT_ACCESS_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missing.push('JWT_REFRESH_SECRET');
  if (missing.length) {
    console.warn('⚠️  WARNING: Missing env vars:', missing.join(', '));
    console.warn('⚠️  Using random defaults. Set these vars for persistent sessions across redeploys.');
  }
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_prod';

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken };
