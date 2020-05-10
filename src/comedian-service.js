const ComedianService = {
    getAllComedians(knex) {
        return knex
            .select('*')
            .from('comedian')
    },
    getById(knex, id) {
        return knex
            .from('comedian')
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
    deleteComedian(knex, id) {
        return knex('comedian')
            .where({ id })
            .delete()
    },
    updateComedian(knex, id, newItemFields) {
        return knex('comedian')
            .where({ id })
            .update(newItemFields)
    },
    insertComedian(knex, newComedian) {
        return knex
            .insert(newComedian)
            .into('comedian')
            .returning('*')
            .then(rows => rows[0])
    },
}

module.exports = ComedianService