require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const knex = require('knex');
const { makeLinksArray } = require('./test-helpers.js')

describe('Link Endpoints', function() {
    let db;

    before('make knex instance', () => {
        console.log(TEST_DATABASE_URL, 'test db url');
        db = knex({
            client: 'pg',
            connection: TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before(() => db.raw('BEGIN; ALTER TABLE links DISABLE TRIGGER ALL; TRUNCATE TABLE links CASCADE; ALTER TABLE links ENABLE TRIGGER ALL; COMMIT;'))

    // describe(`GET /api/link`, () => {
    //     context(`Given no links`, () => {
    //         it(`responds with 200 and an empty list`, () => {
    //             return supertest(app)
    //                 .get('/api/link')
    //                 .expect(200, [])
    //         })
    //     })

    //     context(`Given there are links in the database`, () => {
    //         const testLinks = makeLinksArray()

    //         beforeEach('insert links', () => {
    //             return db
    //                 .into('links')
    //                 .insert(testLinks)
    //         })

    //         it('responds with 200 and all of the links', () => {
    //             return supertest(app)
    //                 .get('/api/links')
    //                 .expect(200)
    //                 // .expect(res => {
    //                 //     expect(res.body.length === testLineups.length)
    //                 // })
    //         })
    //     })
    // })

    // describe(`GET /api/link/:id`, () => {
    //     context(`Given no link`, () => {
    //         it(`responds with 404`, () => {
    //             const linkId = 123456
    //             return supertest(app)
    //                 .get(`/api/link/${linkId}`)
    //                 .expect(404, { error: { 'message': 'Link doesn\'t exist' } })
    //         })
    //     })
    // })

    describe(`POST /`, () => {
        it(`creates a link, responding with 201 and the new link`, () => {
            const newLink = {
                detail: 'This is test detail',
                link: 'This is a test link'
            }
            return supertest(app)
                .post('/api/link')
                .send(newLink)
                .expect(201)
                .expect(res => {
                    expect(res.body.detail).to.eql(newLink.detail),
                    expect(res.body.link).to.eql(newLink.link)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/link/${res.body.id}`)
                        .expect(res.body)
                )
        })
    })
})
module.exports = app;