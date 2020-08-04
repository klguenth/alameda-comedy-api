require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const knex = require('knex');
const helpers = require('./test-helpers');
const { makeLinksArray, makeUsersArray } = require('./test-helpers.js')

describe('Link Endpoints', function() {
    let db;

    const linksArray = makeLinksArray()
    const testUsers = makeUsersArray()
    const user = {
        email: 'klguenth@gmail.com',
        pw: 'Password1!'
    }

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

    before(() => db.raw('BEGIN; ALTER TABLE links DISABLE TRIGGER ALL; TRUNCATE TABLE links CASCADE; ALTER TABLE links ENABLE TRIGGER ALL; COMMIT;'))

    describe(`POST /`, () => {
        it(`creates a link, responding with 201 and the new link`, () => {
            const newLink = {
                detail: 'This is test detail',
                link: 'This is a test link'
            }
            return supertest(app)
                .post('/api/link')
                .set('Authorization', helpers.makeJWTAuthHeader(user))
                .send(newLink)
                .expect(201)
                .expect(res => {
                    expect(res.body.detail).to.eql(newLink.detail),
                    expect(res.body.link).to.eql(newLink.link)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/link/${res.body.id}`)
                        .set('Authorization', helpers.makeJWTAuthHeader(user))
                        .expect(res.body)
                )
        })
    })
})
module.exports = app;