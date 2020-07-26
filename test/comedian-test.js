require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const helpers = require('./test-helpers');
const knex = require('knex');
const express = require('express');
const bcrypt = require('bcrypt');
const { makeComediansArray, makeUsersArray } = require('./test-helpers.js');
const supertest = require('supertest');

describe('Comedian Endpoints', function() {
    let db;
    
    const testComedians = makeComediansArray()
    const testUsers = makeUsersArray()

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

    before(() => db.raw('BEGIN; ALTER TABLE comedian DISABLE TRIGGER ALL; TRUNCATE TABLE comedian CASCADE; ALTER TABLE comedian ENABLE TRIGGER ALL; COMMIT;'))

    describe(`GET /api/comedian`, () => {
        it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
            return supertest(app)
                .get(`/api/comedian`)
                .expect(401, { error: `Missing bearer token` })
        })
        it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
            const userNoCreds = { email: '', pw: '' }
            return supertest(app)
                .get(`/api/comedian/123`)
                .set('Authorization', makeAuthHeader(userNoCreds))
                .expect(401, { error: `Unauthorized request` })
        })
        it(`responds 401 'Unauthorized request' when invalid user`, () => {
            const userInvalidCreds = { email: 'user-not', pw: 'existy' }
            return supertest(app)
                .get(`/api/comedian/1`)
                .set('Authorization', makeAuthHeader(userInvalidCreds))
                .expect(401, { error: `Unauthorized request` })
        })
    })

    describe(`GET /api/comedian`, () => {
        context(`Given no comedians`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/comedian')
                    .set('Authorization', makeJWTAuthHeader())
                    .set('Authorization', makeAuthHeader())
                    .expect(200, [])
            })
        })

        context(`Given there are comedians in the database`, () => {
            const testComedians = makeComediansArray()

            beforeEach('insert comedians', () => {
                return db
                    .into('comedian')
                    .insert(testComedians)
            })

            it('responds with 200 and all of the comedians', () => {
                return supertest(app)
                    .get('/api/comedian')
                    .set('Authorization', makeAuthHeader(testComedians))
                    .expect(200)
            })
        })
    })

    describe(`GET /api/comedian/:id`, () => {
        context(`Given no comedian`, () => {
            beforeEach(() =>
                db.into('users').insert(testUsers)
                )
            it(`responds with 404`, () => {
                const comedianId = 123456
                return supertest(app)
                    .get(`/api/comedian/${comedianId}`)
                    .set('Authorization', makeAuthHeader(testComedians[0]))
                    .expect(404, { error: { 'message': 'Comedian doesn\'t exist' } })
            })
        })
    })

    describe(`POST /`, () => {
        it(`creates a comedian, responding with 201 and the new comedian`, () => {
            const newComedian = {
                first_name: 'firstname',
                last_name: 'lastname',
                phone: '1234567890',
                email: 'email@email.com',
                bio: 'test bio test bio test bio',
                notes: 'test notes test notes test notes',
                category: 'open mic',
                gender: 'female',
                age: 25,
                race: 'white',
                passed: true,
                clean: true,
                ssn: '123456789',
                street: '123 Main Street',
                city: 'Nashville',
                st: 'TN',
                zip: '12345',
                website: 'www.website.com',
                facebook: 'www.facebook.com',
                twitter: 'www.twitter.com',
                instagram: 'www.instagram.com'
            }
            return supertest(app)
                .post('/api/comedian')
                .send(newComedian)
                .expect(201)
                .expect(res => {
                    expect(res.body.first_name).to.eql(newComedian.first_name)
                    expect(res.body.last_name).to.eql(newComedian.last_name)
                    expect(res.body.phone.trim()).to.eql(newComedian.phone)
                    expect(res.body.email).to.eql(newComedian.email)
                    expect(res.body.bio).to.eql(newComedian.bio)
                    expect(res.body.notes).to.eql(newComedian.notes)
                    expect(res.body.category).to.eql(newComedian.category)
                    expect(res.body.gender).to.eql(newComedian.gender)
                    expect(res.body.age).to.eql(newComedian.age)
                    expect(res.body.race).to.eql(newComedian.race)
                    expect(res.body.passed).to.eql(newComedian.passed)
                    expect(res.body.clean).to.eql(newComedian.clean)
                    expect(res.body.ssn.trim()).to.eql(newComedian.ssn)
                    expect(res.body.street).to.eql(newComedian.street)
                    expect(res.body.city).to.eql(newComedian.city)
                    expect(res.body.st).to.eql(newComedian.st)
                    expect(res.body.zip).to.eql(newComedian.zip)
                    expect(res.body.website).to.eql(newComedian.website)
                    expect(res.body.facebook).to.eql(newComedian.facebook)
                    expect(res.body.twitter).to.eql(newComedian.twitter)
                    expect(res.body.instagram).to.eql(newComedian.instagram)
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/comedian/${res.body.id}`)
                        .set('Authorization', makeJWTAuthHeader())
                        .expect(res.body)
                )
        })

        const requiredFields = ['first_name', 'last_name']

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