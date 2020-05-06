const express = require('express');
const AuthService = require('./auth-service');
require('dotenv').config();

const authRouter = express.Router();
const jsonBodyParser = express.json();

authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const { email, pw } = req.body
        const loginUser = { email, pw }

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        AuthService.getUserWithEmail(
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
                        const payload = { user_id: dbUser.is }
                        res.send({
                            authToken: AuthService.createJwt(sub, payload),
                        })
                    })
            })
            .catch(next)
    })

module.exports = authRouter;