const LinkService = {
    getAllLinks(knex) {
        return knex
            .select('*')
            .from('links')
    },
    getByComedianId(knex, comedian_id) {
        return knex
            .from('links')
            .select('*')
            .where('comedian_id', comedian_id)
            .first()
    },
    deleteLink(knex, id) {
        return knex('links')
            .where({ id })
            .delete()
    },
    updateLink(knex, id, newItemFields) {
        return knex('links')
            .where({ id })
            .update(newItemFields)
    },
    insertLink(knex, newLink) {
        return knex
            .insert(newLink)
            .into('links')
            .returning('*')
            .then(rows => rows[0])
    },
}

module.exports = LinkService