const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./config');

const AuthService = {
    getUserWithUserName(db, email) {
        return db('users')
            .where({ email })
            .first()
    },
    comparePasswords(pw, hash) {
        return bcrypt.compare(pw, hash)
    },
    createJwt(subject, payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            subject,
            algorithm: 'HS256',
        })
    },
    makeAuthHeader(user, secret = config.JWT_SECRET) {
        const token = jwt.sign({ user_id: user.id }, secret, {
            subject: user.user_name,
            algorithm: 'HS256',
        })
        return `Bearer ${token}`
    },
    verifyJwt(token) {
        return jwt.verify(token, config.JWT_SECRET, {
            algorithms: ['HS256'],
        })
    },
    parseBasicToken(token) {
        return Buffer
            .from(token, 'base64')
            .toString()
            .split(':')
    },
}

module.exports = AuthService