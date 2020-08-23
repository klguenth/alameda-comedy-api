require('dotenv').config();
const Postgrator = require('postgrator')

const postgrator = new Postgrator({
    "migrationsDirectory": "migrations",
    "driver": "pg",
    "connectionString": (process.env.NODE_ENV === 'test')
        ? process.env.TEST_DATABASE_URL
        : process.env.DATABASE_URL,
    "ssl": !!process.env.SSL,
    "validateChecksums": false,
    "database": (process.env.NODE_ENV === 'test')
        ? "alamedacomedy-test"
        : "alamedacomedy",
    "username": "alamedacomedy",
    "password": "alamedacomedy",
    "schemaTable": "alameda.comedyschema"
})

postgrator
    .migrate('003')
    .then((appliedMigrations) => console.log(appliedMigrations))
    .catch((error) => {
        console.log(error)
        // Because migrations prior to the migration with error would have run
        // error object is decorated with appliedMigrations
        console.log(error.appliedMigrations) // array of migration objects
    })