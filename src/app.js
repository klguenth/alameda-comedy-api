require('dotenv').config()
const { NODE_ENV, PORT, DATABASE_URL, JWT_SECRET } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const knex = require('knex');
const usersRouter = require('./users-router');
const authRouter = require('./auth-router');
const comedianRouter = require('./comedian-router');
const showRouter = require('./show-router');
const lineupRouter = require('./lineup-router');
const linkRouter = require('./link-router');

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.set('db', db)

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/comedian', comedianRouter)
app.use('/api/show', showRouter)
app.use('/api/lineup', lineupRouter)
app.use('/api/link', linkRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})
app.use('*', (req, res, next) => {
    res.status(404).send('It ain\'t here!');
})

app.use(function errorHandler(error, req, res, next) {
    console.error(error)
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { message: error.message, error }
    }
    res.status(500).json(response)
 })

module.exports = app