const express = require('express')
const path = require('path')
const xss = require('xss')
const ShowService = require('./show-service.js')

const showRouter = express.Router()
const jsonBodyParser = express.json()

const shows = [];

const serializeShow = show => ({
    id: show.id,
    title: xss(show.title),
    show_date: show.show_date,
    show_time: show.show_time,
    details: xss(show.details),
    notes: xss(show.notes),
    price_premium: show.price_premium,
    price_general: show.price_general,
    capacity: show.capacity,
    comps: show.comps
})

showRouter
    //get all shows
    .get('/', jsonBodyParser, (req, res, next) => {
        const knex = req.app.get('db')
        ShowService.getAllShows(knex)
            .then(shows => {
                res.json(shows.map(serializeShow))
            })
            .catch(next)
    })
    //create new show
    .post('/', jsonBodyParser, (req, res, next) => {
        const newShow = req.body
        for (const [key, value] of Object.entries(newShow))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        ShowService.insertShow(
            req.app.get('db'),
            newShow
        )
        .then(show => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${show.id}`))
                .json(serializeShow(show))
        })
        .catch(next)
    })

showRouter
    .all('/:id', (req, res, next) => {
        const knex = req.app.get('db')
        ShowService.getById(
            knex,
            req.params.id
        )
        .then(show => {
            if(!show) {
                return res.status(404).json({
                    error: { message: `Show doesn't exist` }
                })
            }
            res.show = show
            next()
        })
        .catch(next)
    })
    //retrieve show with specified id
    .get('/:id', (req, res, next) => {
        res.json(serializeShow(res.show))
    })
    //edit existing show
    .patch('/:id', jsonBodyParser, (req, res, next) => {
        const { title, show_date, show_time, details, notes, price_premium, price_general, capacity, comps } = req.body
        const showToUpdate = { title, show_date, show_time, details, notes, price_premium, price_general, capacity, comps }

        const numberOfValues = Object.values(showToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'title', 'show_date', 'show_time', 'details', 'notes', or 'price_premium', 'price_general', 'capacity', or 'comps'`
                }
            })
        ShowService.updateShow(
            req.app.get('db'),
            req.params.id,
            showToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    //delete show of specified id
    .delete('/:id', (req, res, next) => {
        ShowService.deleteShow(
            req.app.get('db'),
            req.params.id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

// sightingsRouter
//     .get('/species/:species', (req, res, next) => {
//         const knex = req.app.get('db')
//         const species = req.params.species
//         SightingsService.getBySpecies(
//             knex,
//             species
//         )
//         .then(sightings => {
//             res.json(sightings.map(serializeSighting))
//         })
//         .catch(next)
//     })

module.exports = showRouter;