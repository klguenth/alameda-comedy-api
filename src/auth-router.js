const express = require('express');
const AuthService = require('./auth-service');
require('dotenv').config();
const { requireAuth } = require('./jwt-auth');

const authRouter = express.Router();
const jsonBodyParser = express.json();

//logging in a user
authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { email, pw } = req.body
        const loginUser = { email, pw }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        AuthService.getUserWithUserName(
            req.app.get('db'),
            loginUser.email
        )
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect email or password',
                    })

                return AuthService.comparePasswords(loginUser.pw, dbUser.pw)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect user_name or password',
                            })

                    const sub = dbUser.email
                    const payload = { user_id: dbUser.id }
                    let token = AuthService.createJwt(sub, payload)
                    console.log('token', token);
                    return res.status(200).json({
                        authToken: token
                    })
                })
            })
            .catch(next)
    })

module.exports = authRouter;