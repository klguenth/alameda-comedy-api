const express = require('express')
const path = require('path')
const xss = require('xss')
const ShowService = require('./show-service.js')
const { requireAuth } = require('./jwt-auth')

const showRouter = express.Router()
const jsonBodyParser = express.json()

const shows = [];

const serializeShow = show => ({
    id: show.id,
    title: xss(show.title),
    show_date: show.show_date,
    show_time: show.show_time,
    comics: show.comics,
    details: xss(show.details),
    notes: xss(show.notes),
    price_premium: show.price_premium,
    price_general: show.price_general,
    capacity: show.capacity,
    comps: show.comps,
    tix_id: show.tix_id,
    comic_one: show.comic_one,
    comic_two: show.comic_two,
    comic_three: show.comic_three,
    comic_four: show.comic_four,
    comic_five: show.comic_five,
    comic_six: show.comic_six
})

showRouter
    //get all shows
    .get('/', jsonBodyParser, requireAuth, (req, res, next) => {
        const knex = req.app.get('db')
        ShowService.getAllShows(knex)
            .then(shows => {
                res.json(shows.map(serializeShow))
            })
            .catch(next)
    })
    //TODO get upcoming shows
    //limit 24 shows per get

    //create new show
    .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
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
            console.log('show', show);
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${show.id}`))
                .json(serializeShow(show))
        })
        .catch(next)
    })

showRouter
    .all('/:id', requireAuth, (req, res, next) => {
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
    .get('/:id', requireAuth, (req, res, next) => {
        res.json(serializeShow(res.show))
    })
    //edit existing show
    .patch('/:id', jsonBodyParser, requireAuth, (req, res, next) => {
        const { title, show_date, show_time, comics, details, notes, price_premium, price_general, capacity, comps, tix_id, comic_one, comic_two, comic_three, comic_four, comic_five, comic_six } = req.body
        const showToUpdate = { title, show_date, show_time, comics, details, notes, price_premium, price_general, capacity, comps, tix_id, omic_one, comic_two, comic_three, comic_four, comic_five, comic_six }

        const numberOfValues = Object.values(showToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'title', 'show_date', 'show_time', 'comics', 'details', 'notes', 'price_premium', 'price_general', 'capacity', 'comps', 'tix_id', 'comic_one', 'comic_two', 'comic_three', 'comic_four', 'comic_five', 'comic_six'`
                }
            })
        ShowService.updateShow(
            req.app.get('db'),
            req.params.id,
            showToUpdate
        )
        .then(numRowsAffected => {
            res.status(200).json({num: numRowsAffected})
        })
        .catch(next)
    })
    //delete show of specified id
    .delete('/:id', requireAuth, (req, res, next) => {
        ShowService.deleteShow(
            req.app.get('db'),
            req.params.id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = showRouter;