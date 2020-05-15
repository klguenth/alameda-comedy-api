const app = require('../src/app.js');
const { expect } = require('chai');
const helpers = require('./test-helpers');
const knex = require('knex');
const express = require('express');
const bcrypt = require('bcrypt');
const { makeComediansArray } = require('./test-helpers.js')

describe('Show Endpoints', function() {
    let db
    
    const testShows = makeShowsArray()
    const testShowsWithId = testShows.map((show, index) => {
        show.id = index + 1
        return show;
    })

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () =>db('show').truncate())

    afterEach('cleanup', () => db('show').truncate())

    describe(`GET /api/show`, () => {
        context(`Given no shows`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/show')
                    .expect(200, [])
            })
        })

        context(`Given there are shows in the database`, () => {
            const testShows = makeShowsArray()

            beforeEach('insert shows', () => {
                return db
                    .into('show')
                    .insert(testShows)
            })

            it('responds with 200 and all of the shows', () => {
                return supertest(app)
                    .get('/api/show')
                    .expect(200, testShowsWithId)
            })
        })
    })

    describe(`GET /api/show/:id`, () => {
        context(`Given no show`, () => {
            it(`responds with 404`, () => {
                const showId = 123456
                return supertest(app)
                    .get(`/api/show/${showId}`)
                    .expect(404, { error: { 'message': 'Show doesn\'t exist' } })
            })
        })

        context('Given there are comedians in the database', () => {

            beforeEach('insert comedian', () => {
                return db
                    .into('comedian')
                    .insert(testComedians)
            })

            it('responds with 200 and the specified show', () => {
                const showId = 2
                const expectedShow = testShow[showId - 1]
                return supertest(app)
                    .get(`/api/show/${showId}`)
                    .expect(200, expectedShow)
            })
        })
    })

    describe(`POST /`, () => {
        it(`creates a show, responding with 201 and the new show`, () => {
            const newShow = {
                title: 'Show Title',
                show_date: 10/23/2020,
                show_time: 1900,
                details: 'These are the show details',
                notes: 'These are the show notes',
                price_premium: 20.00,
                price_general: 15.00,
                capacity: 150,
                comps: 10
            }
            return supertest(app)
                .post('/api/show')
                .send(newShow)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newShow.title)
                    expect(res.body.show_date).to.eql(newShow.show_date)
                    expect(res.body.show_time).to.eql(newShow.show_time)
                    expect(res.body.details).to.eql(newShow.details)
                    expect(res.body.notes).to.eql(newShow.notes)
                    expect(res.body.price_premium).to.eql(newShow.price_premium)
                    expect(res.body.price_general).to.eql(newShow.price_general)
                    expect(res.body.capacity).to.eql(newShow.capacity)
                    expect(res.body.comps).to.eql(newShow.comps)
                    expect(res.body).to.have.property('id')
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/show/${res.body.id}`)
                        .expect(res.body)
                )
        })

        const requiredFields = ['title', 'show_date', 'show_time', 'price_premium', 'price_general']

        requiredFields.forEach(key => {
            const newComedian = {
                first_name: 'firstname',
                last_name: 'lastname',
            }
            it(`responds with 400 and an error message when the '${key}', is missing`, () => {
                for (const [key, value] of Object.entries(newComedian))
                    if (value == null)
                return supertest(app)
                    .post('/api/comedian')
                    .send(newComedian)
                    .expect(400, {
                        error: { message: `Missing '${key}' in request body` }
                    })
            })
        })
    })
})
module.exports = app;