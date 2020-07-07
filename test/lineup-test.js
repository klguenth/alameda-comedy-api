require('dotenv').config()
const app = require('../src/app.js');
const { expect } = require('chai');
const { TEST_DATABASE_URL } = require('../src/config');
const knex = require('knex');
const { makeLineupsArray, makeShowsArray, makeComediansArray } = require('./test-helpers.js')

describe('Lineup Endpoints', function() {
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

    before(() => db.raw('BEGIN; ALTER TABLE lineup DISABLE TRIGGER ALL; TRUNCATE TABLE lineup CASCADE; ALTER TABLE lineup ENABLE TRIGGER ALL; COMMIT;'))

    // describe(`GET /api/lineup`, () => {
    //     context(`Given no lineups`, () => {
    //         it(`responds with 200 and an empty list`, () => {
    //             return supertest(app)
    //                 .get('/api/lineup')
    //                 .expect(200, [])
    //         })
    //     })

    //     context(`Given there are lineups in the database`, () => {
    //         const testLineups = makeLineupsArray()

    //         beforeEach('insert lineups', () => {
    //             return db
    //                 .into('lineup')
    //                 .insert(testLineups)
    //         })

    //         it('responds with 200 and all of the lineups', () => {
    //             return supertest(app)
    //                 .get('/api/lineup')
    //                 .expect(200)
    //                 // .expect(res => {
    //                 //     expect(res.body.length === testLineups.length)
    //                 // })
    //         })
    //     })
    // })

    // describe(`GET /api/lineup/:id`, () => {
    //     context(`Given no lineup`, () => {
    //         it(`responds with 404`, () => {
    //             const lineupId = 123456
    //             return supertest(app)
    //                 .get(`/api/lineup/${lineupId}`)
    //                 .expect(404, { error: { 'message': 'Lineup doesn\'t exist' } })
    //         })
    //     })
    // })

    describe(`POST /`, () => {
    context(`Given there are lineups in the database`, () => {
        const testLineups = makeLineupsArray()
        const testShows = makeShowsArray()
        const testComedians = makeComediansArray()

        beforeEach('insert lineups', () => {
            let comedianIds = null;
            let showIds = null;
            return db
                .insert(testComedians)
                .into('comedian')
                .returning('id')
                .then((id) => {
                    comedianIds = id;
                    return db;
                })
                .then(db => {
                    return db
                    .insert(testShows)
                    .into('show')
                    .returning('id')
                    .then((id) => {
                        showIds = id;
                        return db;
                    })
                })
                .then(() => {
                    console.log(comedianIds);
                    console.log(showIds);
                    testLineups[0].comedian_id = comedianIds[0];
                    testLineups[1].comedian_id = comedianIds[1];
                    testLineups[0].show_id = showIds[0];
                    testLineups[1].show_id = showIds[1];
                    return db
                        .into('lineup')
                        .insert(testLineups)
                })
        })

        it(`creates a lineup, responding with 201 and the new lineup`, () => {
            const newLineup = testLineups[0];
            return supertest(app)
                .post('/api/lineup')
                .send(newLineup)
                .expect(201)
                .expect(res => {
                    expect(res.body.set_time).to.eql(newLineup.set_time),
                    expect(res.body.comedian_id).to.eql(newLineup.comedian_id),
                    expect(res.body.show_id).to.eql(newLineup.show_id)
                })
                // .then(res => 
                //     supertest(app)
                //         .get(`/api/lineup/${res.body.id}`)
                //         .expect(res.body)
                // )
        })

        const requiredFields = ['set_time', 'comedian_id', 'show_id']

        requiredFields.forEach(key => {
            const newLineup = {
                set_time: 20,
                comedian_id: 1,
                show_id: 1
            }
            it(`responds with 400 and an error message when the '${key}', is missing`, () => {
                for (const [key, value] of Object.entries(newLineup))
                // console.log(key, value, 'key and value')
                    if (value == null)
                return supertest(app)
                    .post('/api/lineup')
                    .send(newLineup)
                    .expect(400, {
                        error: { message: `Missing '${key}' in request body` }
                    })
            })
        })
    })
})
})
module.exports = app;