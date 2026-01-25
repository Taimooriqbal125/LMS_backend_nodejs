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
