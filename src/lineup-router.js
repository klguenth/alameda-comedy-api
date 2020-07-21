const express = require('express')
const path = require('path')
const LineupService = require('./lineup-service.js')
const { requireAuth } = require('./jwt-auth')

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
    // create new lineup
    .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
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
    //edit existing lineup
    .patch('/:id', jsonBodyParser, requireAuth, (req, res, next) => {
        const { show_id, comedian_id, set_time } = req.body
        const lineupToUpdate = { show_id, comedian_id, set_time }

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
    .delete('/:id', requireAuth, (req, res, next) => {
        LineupService.deleteLineup(
            req.app.get('db'),
            req.params.id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = lineupRouter;