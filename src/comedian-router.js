const express = require('express')
const path = require('path')
const xss = require('xss')
const ComedianService = require('./comedian-service.js')
const { requireAuth } = require('./jwt-auth')

const comedianRouter = express.Router()
const jsonBodyParser = express.json()

const comedians = [];

const serializeComedian = comedian => ({
    id: comedian.id,
    first_name: xss(comedian.first_name),
    last_name: xss(comedian.last_name),
    phone: xss(comedian.phone),
    email: xss(comedian.email),
    bio: xss(comedian.bio),
    notes: xss(comedian.notes),
    category: xss(comedian.category),
    gender: comedian.gender,
    age: comedian.age,
    race: comedian.race,
    passed: comedian.passed,
    clean: comedian.clean,
    ssn: xss(comedian.ssn),
    street: xss(comedian.street),
    city: xss(comedian.city),
    st: xss(comedian.st),
    zip: xss(comedian.zip),
    website: xss(comedian.website),
    facebook: xss(comedian.facebook),
    twitter: xss(comedian.twitter),
    instagram: xss(comedian.instagram)
})

comedianRouter
    //get all comedians
    .get('/', jsonBodyParser, requireAuth, (req, res, next) => {
        const knex = req.app.get('db')
        ComedianService.getAllComedians(knex)
            .then(comedians => {
                // if(!comedians) {
                //     return res.status(404).json({
                //         error: { message: `Comedian doesn't exist` }
                //     })
                // }
                res.json(comedians.map(serializeComedian))
            })
            .catch(next)
    })
    //create new comedian
    .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
        const newComedian = req.body
        console.log('new comedian', newComedian);
        for (const [key, value] of Object.entries(newComedian))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        ComedianService.insertComedian(
            req.app.get('db'),
            newComedian
        )
        .then(comedian => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${comedian.id}`))
                .json(serializeComedian(comedian))
        })
        .catch(next)
    })

comedianRouter
    .all('/:id', requireAuth, (req, res, next) => {
        const knex = req.app.get('db')
        ComedianService.getById(
            knex,
            req.params.id
        )
        .then(comedian => {
            if(!comedian) {
                return res.status(404).json({
                    error: { message: `Comedian doesn't exist` }
                })
            }
            res.comedian = comedian
            next()
        })
        .catch(next)
    })
    //retrieve comedian with specified id
    .get('/:id', requireAuth, (req, res, next) => {
        res.json(serializeComedian(res.comedian))
    })
    //edit existing comedian
    .patch('/:id', jsonBodyParser,requireAuth, (req, res, next) => {
        const { first_name, last_name, phone, email, bio, notes, category, gender, age, race, passed, clean, ssn, street, city, st, zip, website, facebook, twitter, instagram } = req.body
        const comedianToUpdate = { first_name, last_name, phone, email, bio, notes, category, gender, age, race, passed, clean, ssn, street, city, st, zip, website, facebook, twitter, instagram }

        const numberOfValues = Object.values(comedianToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'first_name', 'last_name', 'phone', 'email', 'bio', 'notes', 'category', 'gender', 'age', 'race', 'passed', 'clean', 'ssn', 'street', 'city', 'st', 'zip', 'website', 'facebook', 'twitter', or 'instagram'`
                }
            })
        ComedianService.updateComedian(
            req.app.get('db'),
            req.params.id,
            comedianToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    //delete comedian of specified id
    .delete('/:id', requireAuth, (req, res, next) => {
        ComedianService.deleteComedian(
            req.app.get('db'),
            req.params.id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = comedianRouter;