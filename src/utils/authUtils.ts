import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Sign JWT Token
 * @param {number} id - User ID
 * @returns {string} - JWT Token
 */
export const signToken = (id: number): string => {
    const options: SignOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN as any,
    };
    return jwt.sign({ id }, process.env.JWT_SECRET as Secret, options);
};

/**
 * Sign JWT Refresh Token
 * @param {number} id - User ID
 * @returns {string} - JWT Refresh Token
 */
export const signRefreshToken = (id: number): string => {
    const options: SignOptions = {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
    };
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as Secret, options);
};

/**
 * Hash Password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 12);
};

/**
 * Check Password
 * @param {string} candidatePassword - Plain text password from user
 * @param {string} userPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if match
 */
export const comparePasswords = async (
    candidatePassword: string,
    userPassword: string,
): Promise<boolean> => {
    return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Generate 6-digit OTP
 * @returns {string} - 6-digit OTP string
 */
export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export default {
    signToken,
    signRefreshToken,
    hashPassword,
    comparePasswords,
    generateOTP,
};
    