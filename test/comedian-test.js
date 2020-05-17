require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DB_URL } = require('../src/config');
const helpers = require('./test-helpers');
const knex = require('knex');
const express = require('express');
const bcrypt = require('bcrypt');
const { makeComediansArray } = require('./test-helpers.js')

describe('Comedian Endpoints', function() {
    let db;
    
    const testComedians = makeComediansArray()
    const testComediansWithId = testComedians.map((comedian, index) => {
        comedian.comedian_id = index + 1
        return comedian;
    })

    before('make knex instance', () => {
        console.log(TEST_DB_URL, 'test db url');
        db = knex({
            client: 'pg',
            connection: TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before(() => db.raw('TRUNCATE comedian RESTART IDENTITY CASCADE'));

    before('clean the table', () => db('comedian').truncate())

    afterEach('cleanup', () => db('comedian').truncate())

    describe(`GET /api/comedian`, () => {
        context(`Given no comedians`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/comedian')
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
                    .expect(200, testComediansWithId)
            })
        })
    })

    describe(`GET /api/comedian/:comedian_id`, () => {
        context(`Given no comedian`, () => {
            it(`responds with 404`, () => {
                const comedianId = 123456
                return supertest(app)
                    .get(`/api/comedian/${comedianId}`)
                    .expect(404, { error: { 'message': 'Comedian doesn\'t exist' } })
            })
        })

        context('Given there are comedians in the database', () => {

            beforeEach('insert comedian', () => {
                return db
                    .into('comedian')
                    .insert(testComedians)
            })

            it('responds with 200 and the specified comedian', () => {
                const comedianId = 2
                const expectedComedian = testComedians[comedianId - 1]
                return supertest(app)
                    .get(`/api/comedian/${comedianId}`)
                    .expect(200, expectedComedian)
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
                age: '25',
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
                    expect(res.body.phone).to.eql(newComedian.phone)
                    expect(res.body.email).to.eql(newComedian.email)
                    expect(res.body.bio).to.eql(newComedian.bio)
                    expect(res.body.notes).to.eql(newComedian.notes)
                    expect(res.body.category).to.eql(newComedian.category)
                    expect(res.body.gender).to.eql(newComedian.gender)
                    expect(res.body.age).to.eql(newComedian.age)
                    expect(res.body.race).to.eql(newComedian.race)
                    expect(res.body.passed).to.eql(newComedian.passed)
                    expect(res.body.clean).to.eql(newComedian.clean)
                    expect(res.body.ssn).to.eql(newComedian.ssn)
                    expect(res.body.street).to.eql(newComedian.street)
                    expect(res.body.city).to.eql(newComedian.city)
                    expect(res.body.st).to.eql(newComedian.st)
                    expect(res.body.zip).to.eql(newComedian.zip)
                    expect(res.body.website).to.eql(newComedian.website)
                    expect(res.body.facebook).to.eql(newComedian.facebook)
                    expect(res.body.twitter).to.eql(newComedian.twitter)
                    expect(res.body.instagram).to.eql(newComedian.instagram)
                    expect(res.body).to.have.property('id')
                })
                .then(res => 
                    supertest(app)
                        .get(`/api/comedian/${res.body.id}`)
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