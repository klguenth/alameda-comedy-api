const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
      {
        full_name: 'Kelsey Guenther',
        email: 'klguenth@gmail.com',
        pw: 'Password1!'
      },
      {
        full_name: 'Test user 1',
        email: 'email1@email.com',
        pw: 'password'
      },
      {
        full_name: 'Test user 2',
        email: 'email2@email.com',
        pw: 'password'
      },
      {
        full_name: 'Test user 3',
        email: 'email3@email.com',
        pw: 'password'
      },
      {
        full_name: 'Test user 4',
        email: 'email4@email.com',
        pw: 'password'
      },
    ]
  }
  
  function makeComediansArray() {
    return [
        {
            first_name: 'John',
            last_name: 'Smith',
            phone: '123-456-7890',
            email: 'johnsmith@email.com',
            bio: "This is a test bio for John Smith",
            notes: 'These are test notes for John Smith',
            category: 'open mic',
            gender: 'male',
            age: 30,
            race: 'white',
            passed: true,
            clean: true,
            ssn: '987-65-4321',
            street: '135 Maple Street',
            city: 'Asheville',
            st: 'NC',
            zip: '98765',
            website: 'www.johnsmithcomedy.com',
            facebook: 'www.facebook.com/johnsmithcomedy',
            twitter: 'www.twitter.com/jsmithcomedy',
            instagram: 'www.instagram.com/jsmithcomedy',
        },
        {
            first_name: 'Harper',
            last_name: 'Noelle',
            phone: '654-321-9876',
            email: 'harpernoelle@email.com',
            bio: "This is a test bio for Harper Noelle",
            notes: 'These are test notes for Harper Noelle',
            category: 'open mic',
            gender: 'female',
            age: 32,
            race: 'white',
            passed: true,
            clean: true,
            ssn: '876-78-5432',
            street: '7654 Second Ave',
            city: 'Manhattan',
            st: 'NY',
            zip: '54367',
            website: 'www.harpernoellestandup.com',
            facebook: 'www.facebook.com/harpernoellestandup',
            twitter: 'www.twitter.com/hnoelle',
            instagram: 'www.instagram.com/hnoelle',
        }
    ]
}

  function makeShowsArray() {
    return [
      {
        title: 'Amateur Showcase',
        show_date: '2020-07-11',
        show_time: '18:00:00',
        details: 'These are the details',
        notes: 'These are the notes',
        price_premium: '$20.00',
        price_general: '$15.00',
        capacity: 150,
        comps: 5,
        tix_id: 1
      },
      {
        title: 'Professional Showcase',
        show_date: '2020-08-30',
        show_time: '18:00:00',
        details: 'These are the details',
        notes: 'These are the notes',
        price_premium: '$20.00',
        price_general: '$15.00',
        capacity: 150,
        comps: 10,
        tix_id: 2
      }
    ]
  }

  function makeLineupsArray() {
    return [
      {
        show_id: null,
        comedian_id: null,
        set_time: 15
      },
      {
        show_id: null,
        comedian_id: null,
        set_time: 10
      }
    ]
  }

  function makeLinksArray() {
    [
      {
        detail: 'This is test detail',
        link: 'This is a test link'
      }
    ]
  }
  
  function makeExpectedComedian(comedians=[]) {
    return {
      first_name: comedian.first_name,
      last_name: comedian.last_name,
      phone: comedian.phone,
      email: comedian.email,
      bio: comedian.bio,
      notes: comedian.notes,
      category: comedian.category,
      gender: comedian.gender,
      age: comedian.age,
      race: comedian.race,
      passed: comedian.passed,
      clean: comedian.clean,
      ssn: comedian.ssn,
      street: comedian.street,
      city: comedian.city,
      st: comedian.st,
      zip: comedian.zip,
      website: comedian.website,
      facebook: comedian.facebook,
      twitter: comedian.twitter,
      instagram: comedian.instagram
    }
  }
  
  function makeMaliciousComedian(user) {
    const maliciousComedian = {
      first_name: 'I am malicious<script>alert("xss");</script>',
      last_name: 'Question',
      phone: 'What kind of bear is best',
      email: 'False',
      bio: 'Black Bear',
      notes: 'Bears',
      category: 'Beets',
      gender: 'Battlestar',
      age: 'Galactica',
      race: 'MICHAEL',
      passed: 'MICHAEL',
      clean: true,
      ssn: '123-45-1234',
      street: '000 Bad Boulevard',
      city: 'Bad Place',
      st: 'NO',
      zip: '12345',
      website: `Bears, Beets, Battlestar Galactica onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      facebook: 'www.facebook.com/badbadbad',
      twitter: 'www.twitter.com/badnewsbears',
      instagram: 'www.instagram.com/badnewsbears'
    }
    const expectedComedian = {
      ...makeExpectedComedian([user], maliciousComedian),
      first_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      bio: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
      maliciousComedian,
      expectedComedian,
    }
  }
  
  function makeComediansFixtures() {
    const testUsers = makeUsersArray()
    const testComedians = makeComediansArray(testUsers)
    return { testUsers, testComedians }
  }

  function seedUsers(db, users) {
      const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }))
      return db.into('users').insert(preppedUsers)
        .then(() => {})
    }
  
  function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE
          users,
          comedian,
          show
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE comedian_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('comedian_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
        ])
      )
    )
  }
  
  function seedComedianTables(db, users, comedians=[], shows=[]) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await trx.into('users').insert(users)
      await trx.into('comedian').insert(comedians)
      await trx.into('show').insert(shows)
      // update the auto sequence to match the forced id values
      await Promise.all([
        trx.raw(
          `SELECT setval('user_id_seq', ?)`,
          [users[users.length - 1].id],
        ),
        trx.raw(
          `SELECT setval('comedian_id_seq', ?)`,
          [comedians[comedians.length - 1].id],
        ),
        trx.raw(
          `SELECT setval('show_id_seq', ?)`,
          [shows[shows.length - 1].id],
        ),
      ])
    })
  }
  
  function seedMaliciousComedian(db, user, comedian) {
    return db
      .into('comedian')
      .insert([user])
      .then(() =>
        db
          .into('comedian')
          .insert([comedian])
      )
  }

  function makeJWTAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }
  
  module.exports = {
    makeUsersArray,
    makeComediansArray,
    makeShowsArray,
    makeLineupsArray,
    makeLinksArray,
    makeExpectedComedian,
    makeMaliciousComedian,
    makeJWTAuthHeader,
    makeComediansFixtures,
    // cleanTables,
    seedUsers,
    seedComedianTables,
    seedMaliciousComedian,
  }