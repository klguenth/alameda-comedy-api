require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DB_URL } = require('../src/config');
const knex = require('knex');
const { makeLineupsArray } = require('./test-helpers.js')

describe('Lineup Endpoints', function() {
    let db;

    before('make knex instance', () => {
        console.log(TEST_DB_URL, 'test db url');
        db = knex({
            client: 'pg',
            connection: TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before(() => db.raw('BEGIN; ALTER TABLE show DISABLE TRIGGER ALL; TRUNCATE TABLE show CASCADE; ALTER TABLE show ENABLE TRIGGER ALL; COMMIT;'))

    describe(`GET /api/lineup`, () => {
        context(`Given no lineups`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/lineup')
                    .expect(200, [])
            })
        })

        context(`Given there are lineups in the database`, () => {
            const testLineups = makeLineupsArray()

            beforeEach('insert lineups', () => {
                return db
                    .into('lineup')
                    .insert(testLineups)
            })

            it('responds with 200 and all of the lineups', () => {
                return supertest(app)
                    .get('/api/lineup')
                    .expect(200)
                    // .expect(res => {
                    //     expect(res.body.length === testLineups.length)
                    // })
            })
        })
    })

    describe(`GET /api/lineup/:id`, () => {
        context(`Given no lineup`, () => {
            it(`responds with 404`, () => {
                const lineupId = 123456
                return supertest(app)
                    .get(`/api/lineup/${lineupId}`)
                    .expect(404, { error: { 'message': 'Lineup doesn\'t exist' } })
            })
        })
    })

    describe(`POST /`, () => {
        it(`creates a lineup, responding with 201 and the new lineup`, () => {
            const newLineup = {
                set_time: 20,
            }
            return supertest(app)
                .post('/api/lineup')
                .send(newLineup)
                .expect(201)
                .expect(res => {
                    expect(res.body.set_time).to.eql(newLineup.set_time)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/lineup/${res.body.id}`)
                        .expect(res.body)
                )
        })

        // const requiredFields = ['title', 'show_date', 'show_time', 'price_premium', 'price_general']

        // requiredFields.forEach(key => {
        //     const newShow = {
        //         title: 'title',
        //         show_date: '6/12/2020',
        //         show_time: 1900,
        //         price_premium: 20,
        //         price_general: 15
        //     }
        //     it(`responds with 400 and an error message when the '${key}', is missing`, () => {
        //         for (const [key, value] of Object.entries(newShow))
        //             if (value == null)
        //         return supertest(app)
        //             .post('/api/show')
        //             .send(newShow)
        //             .expect(400, {
        //                 error: { message: `Missing '${key}' in request body` }
        //             })
        //     })
        // })
    })
})
module.exports = app;