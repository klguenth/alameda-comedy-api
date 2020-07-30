require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const knex = require('knex');
const { makeLinksArray } = require('./test-helpers.js')

describe('Link Endpoints', function() {
    let db;

    const linksArray = makeLinksArray()

    function makeAuthHeader(user) {
        const token = Buffer.from(`${user.email}:${user.pw}`).toString('base64')
        return `Bearer ${token}`
    }

    function makeJWTAuthHeader() {
        return `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1OTU1NTc5NzMsInN1YiI6ImtsZ3VlbnRoQGdtYWlsLmNvbSJ9.pNZHVdmDjefdyJMWKrT4GoL2id9VtK7B_hkz8zUmsbU`;
    }

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

    describe(`GET /api/link`, () => {
    it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
            .get(`/api/link`)
            .expect(401, { error: `Missing bearer token` })
    })
    it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
        const userNoCreds = { email: '', pw: '' }
        return supertest(app)
            .get(`/api/link/123`)
            .set('Authorization', makeAuthHeader(userNoCreds))
            .expect(401, { error: `Unauthorized request` })
    })
    it(`responds 401 'Unauthorized request' when invalid user`, () => {
        const userInvalidCreds = { email: 'user-not', pw: 'existy' }
        return supertest(app)
            .get(`/api/link/1`)
            .set('Authorization', makeAuthHeader(userInvalidCreds))
            .expect(401, { error: `Unauthorized request` })
    })
})

    describe(`POST /`, () => {
        it(`creates a link, responding with 201 and the new link`, () => {
            const newLink = {
                detail: 'This is test detail',
                link: 'This is a test link'
            }
            return supertest(app)
                .post('/api/link')
                .set('Authorization', makeJWTAuthHeader())
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