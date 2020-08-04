const AuthService = require('./auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''
    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing Bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    // const [tokenUserName, tokenPassword] = Buffer
    //     .from(basicToken, 'base64')
    //     .toString()
    //     .split(':')

    // if (!tokenUserName || !tokenPassword) {
    //     console.log('request two')
    //     return res.status(401).json({ error: 'Unauthorized request' })
    // }
    // req.app.get('db')('users')
    //     .where({ email: tokenUserName })
    //     .first()
    //     .then(user => {
    //         if (!user) {
    //             console.log('request three')
    //             return res.status(401).json({ error: 'Unauthorized request' })
    //         }
    //         next()
    //     })
    //     .catch(next)
    try {
        const payload = AuthService.verifyJwt(bearerToken)
        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub,
        )
        .then(user => {
            if (!user)
                return res.status(401).json({ error: 'Unauthorized request one' })
            req.user = user
            next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })
    } catch(error) {
        res.status(401).json({ error: 'Unauthorized request two' })
    }
}

// function requireJWTAuth(req, res, next) {
//     const authToken = req.get('Authorization') || ''

//     let bearerToken
//     if (!authToken.toLowerCase().startsWith('bearer ')) {
//         return res.status(401).json({ error: 'Missing bearer token' })
//     } else {
//         bearerToken = authToken.slice(7, authToken.length)
//     }

//     const [tokenUserName, tokenPassword] = Buffer
//         .from(bearerToken, 'jwt')
//         .toString()
//         .split(':')

//     if (!tokenUserName || !tokenPassword) {
//         return res.status(401).json({ error: 'Unauthorized request' })
//     }
//     req.app.get('db')('users')
//         .where({ email: tokenUserName })
//         .first()
//         .then(user => {
//             if (!user) {
//                 return res.status(401).json({ error: 'Unauthorized request' })
//             }
//             next()
//         })
//         .catch(next)

module.exports = {
    requireAuth,
}