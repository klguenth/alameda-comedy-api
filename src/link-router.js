const express = require('express')
const path = require('path')
const xss = require('xss')
const LinkService = require('./link-service.js')
const { requireAuth } = require('./jwt-auth')

const linkRouter = express.Router()
const jsonBodyParser = express.json()

const links = [];

const serializeLink = link => ({
    id: link.id,
    detail: xss(link.detail),
    link: xss(link.link),
    comedian_id: link.comedian_id
})

linkRouter
    .post('/', jsonBodyParser, requireAuth, (req, res, next) => {
        const newLink = req.body
        for (const [key, value] of Object.entries(newLink))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
        LinkService.insertLink(
            req.app.get('db'),
            newLink
        )
        .then(link => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${link.id}`))
                .json(serializeLink(link))
        })
        .catch(next)
    })

linkRouter
    //get by link id
    .all('/:id', requireAuth, (req, res, next) => {
        const knex = req.app.get('db')
        LinkService.getByLinkId(
            knex,
            req.params.id
        )
        .then(link => {
            if(!link) {
                return res.status(404).json({
                    error: { message: `Link doesn't exist` }
                })
            }
            res.link = link
            next()
        })
        .catch(next)
    })
    //retrieve link with specified id
    .get('/:d', requireAuth, (req, res, next) => {
        res.json(serializeLink(res.link))
    })
    //edit existing link
    .patch('/:id', jsonBodyParser, requireAuth, (req, res, next) => {
        const { detail, link, comedian_id } = req.body
        const linkToUpdate = { detail, link, comedian_id }

        const numberOfValues = Object.values(linkToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'detail', 'link', or 'comedian_id'`
                }
            })
        LinkService.updateLink(
            req.app.get('db'),
            req.params.id,
            linkToUpdate
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })
    //delete link of specified id
    .delete('/:id', requireAuth, (req, res, next) => {
        LinkService.deleteLink(
            req.app.get('db'),
            req.params.id
        )
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
    })

module.exports = linkRouter;