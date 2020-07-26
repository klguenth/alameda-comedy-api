require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const knex = require('knex');
const { makeShowsArray, makeUsersArray } = require('./test-helpers.js')

describe('Show Endpoints', function() {
    let db;

    const testShows = makeShowsArray()
    const testUsers = makeUsersArray()

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.email}:${user.pw}`).toString('base64')
        return `Bearer ${token}`
    }

    function makeJWTAuthHeader() {
        return `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1OTU1NTc5NzMsInN1YiI6ImtsZ3VlbnRoQGdtYWlsLmNvbSJ9.pNZHVdmDjefdyJMWKrT4GoL2id9VtK7B_hkz8zUmsbU`;
    }

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before(() => db.raw('BEGIN; ALTER TABLE show DISABLE TRIGGER ALL; TRUNCATE TABLE show CASCADE; ALTER TABLE show ENABLE TRIGGER ALL; COMMIT;'))

    describe(`GET /api/show`, () => {
        it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app)
                .get(`/api/show`)
                .expect(401, { error: `Missing bearer token` })
        })
        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
            const userNoCreds = { email: '', pw: '' }
            return supertest(app)
                .get(`/api/show/123`)
                .set('Authorization', makeAuthHeader(userNoCreds))
                .expect(401, { error: `Unauthorized request` })
        })
        it(`responds 401 'Unauthorized request' when invalid user`, () => {
            const userInvalidCreds = { email: 'user-not', pw: 'existy' }
            return supertest(app)
                .get(`/api/show/1`)
                .set('Authorization', makeAuthHeader(userInvalidCreds))
                .expect(401, { error: `Unauthorized request` })
        })
    })


    describe(`GET /api/show`, () => {
        context(`Given no shows`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/show')
                    .set('Authorization', makeJWTAuthHeader())
                    .set('Authorization', makeAuthHeader())
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
                    .set('Authorization', makeJWTAuthHeader())
                    .set('Authorization', makeAuthHeader())
                    .expect(200)
                    .expect(res => {
                        expect(res.body.length === testShows.length)
                    })
            })
        })
    })

    describe(`GET /api/show/:id`, () => {
        context(`Given no show`, () => {
            it(`responds with 404`, () => {
                const showId = 123456
                return supertest(app)
                    .get(`/api/show/${showId}`)
                    .set('Authorization', makeJWTAuthHeader())
                    .set('Authorization', makeAuthHeader())
                    .expect(404, { error: { 'message': 'Show doesn\'t exist' } })
            })
        })
    })

    describe(`POST /`, () => {
        it(`creates a show, responding with 201 and the new show`, () => {
            const newShow = {
                title: 'Show Title',
                show_date: '2020-10-03',
                show_time: '19:00:00',
                details: 'Here are the show details',
                notes: 'Here are the show notes',
                price_premium: '$20.00',
                price_general: '$15.00',
                capacity: 150,
                comps: 5,
                tix_id: 3,
            }
            return supertest(app)
                .post('/api/show')
                .set('Authorization', makeJWTAuthHeader())
                .set('Authorization', makeAuthHeader())
                .send(newShow)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newShow.title),
                    expect(res.body.show_date.slice(0,10)).to.eql(newShow.show_date.slice(0,10)),
                    expect(res.body.show_time).to.eql(newShow.show_time),
                    expect(res.body.details).to.eql(newShow.details),
                    expect(res.body.notes).to.eql(newShow.notes),
                    expect(res.body.price_premium).to.eql(newShow.price_premium),
                    expect(res.body.price_general).to.eql(newShow.price_general),
                    expect(res.body.capacity).to.eql(newShow.capacity),
                    expect(res.body.comps).to.eql(newShow.comps),
                    expect(res.body.tix_id).to.eql(newShow.tix_id)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/show/${res.body.id}`)
                        .expect(res.body)
                )
        })

        const requiredFields = ['title', 'show_date', 'show_time', 'price_premium', 'price_general']

        requiredFields.forEach(key => {
            const newShow = {
                title: 'title',
                show_date: '6/12/2020',
                show_time: 1900,
                price_premium: 20,
                price_general: 15
            }
            it(`responds with 400 and an error message when the '${key}', is missing`, () => {
                for (const [key, value] of Object.entries(newShow))
                    if (value == null)
                return supertest(app)
                    .post('/api/show')
                    .set('Authorization', makeJWTAuthHeader())
                    .set('Authorization', makeAuthHeader())
                    .send(newShow)
                    .expect(400, {
                        error: { message: `Missing '${key}' in request body` }
                    })
            })
        })
    })
})
module.exports = app;