const LineupService = {
    getAllLineups(knex) {
        return knex
            .select('*')
            .from('lineup')
    },
    getById(knex, id) {
        return knex
            .from('lineup')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteLineup(knex, id) {
        return knex('lineup')
            .where({ id })
            .delete()
    },
    updateLineup(knex, id, newItemFields) {
        return knex('lineup')
            .where({ id })
            .update(newItemFields)
    },
    insertLineup(knex, newLineup) {
        return knex
            .insert(newLineup)
            .into('lineup')
            .returning('*')
            .then(rows => rows[0])
    },
}

module.exports = LineupService