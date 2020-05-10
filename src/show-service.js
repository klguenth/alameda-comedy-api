const ShowService = {
    getAllShow(knex) {
        return knex
            .select('*')
            .from('show')
    },
    getById(knex, id) {
        return knex
            .from('show')
            .select('*')
            .where('id', id)
            .first()
    },
    // getBySpecies(knex, species) {
    //     return knex
    //         .from('sightings')
    //         .select('*')
    //         .where('species', species)
    // },
    deleteShow(knex, id) {
        return knex('show')
            .where({ id })
            .delete()
    },
    updateShow(knex, id, newItemFields) {
        return knex('show')
            .where({ id })
            .update(newItemFields)
    },
    insertShow(knex, newShow) {
        return knex
            .insert(newShow)
            .into('show')
            .returning('*')
            .then(rows => rows[0])
    },
}

module.exports = ShowService