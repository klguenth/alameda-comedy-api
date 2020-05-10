const express = require('express')
const path = require('path')
const LineupService = require('./lineup-service.js')

const lineupRouter = express.Router()
const jsonBodyParser = express.json()

const lineups = [];

const serializeLineup = lineup => ({
    id: lineup.id,
    show_id: lineup.show_id,
    comedian_id: lineup.comedian_id,
    set_time: lineup.set_time
})

lineupRouter
    //get all lineups
    .get('/', jsonBodyParser, (req, res, next) => {
        const knex = req.app.get('db')
        LineupService.getAllLineups(knex)
            .then(lineups => {
                res.json(lineups.map(serializelineup))
            })
            .catch(next)
    })
    //create new lineup
    .post('/', jsonBodyParser, (req, res, next) => {
        const newLineup = req.body
        for (const [key, value] of Object.entries(newLineup))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        LineupService.insertLineup(
            req.app.get('db'),
            newLineup
        )
        .then(lineup => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${lineup.id}`))
                .json(serializeLineup(lineup))
        })
        .catch(next)
    })

lineupRouter
    .all('/:id', (req, res, next) => {
        const knex = req.app.get('db')
        LineupService.getById(
            knex,
            req.params.id
        )
        .then(lineup => {
            if(!lineup) {
                return res.status(404).json({
                    error: { message: `Lineup doesn't exist` }
                })
            }
            res.lineup = lineup
            next()
        })
        .catch(next)
    })
    //retrieve lineup with specified id
    .get('/:id', (req, res, next) => {
        res.json(serializeLineup(res.lineup))
    })
    //edit existing lineup
    .patch('/:id', jsonBodyParser, (req, res, next) => {
        const { show_id, comedian_id, set_time } = req.body
        const showToUpdate = { show_id, comedian_id, set_time }

        const numberOfValues = Object.values(lineupToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'show_id', 'comedian_id', or 'set_time'`
                }
            })
        LineupService.updateLineup(
            req.app.get('db'),
            req.params.id,
            lineupToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    //delete lineup of specified id
    .delete('/:id', (req, res, next) => {
        LineupService.deleteLineup(
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

module.exports = lineupRouter;