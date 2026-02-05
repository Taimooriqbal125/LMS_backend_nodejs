const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Sign JWT Token
 * @param {number} id - User ID
 * @returns {string} - JWT Token
 */
exports.signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};


/**
 * Sign JWT Refresh Token
 * @param {number} id - User ID
 * @returns {string} - JWT Refresh Token
 */
exports.signRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // e.g., '7d' or '30d'
    });
};


/**
 * Hash Password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

/**
 * Check Password
 * @param {string} candidatePassword - Plain text password from user
 * @param {string} userPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if match
 */
exports.comparePasswords = async (candidatePassword, userPassword) => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP string
 */
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
