const LinkService = {
    getAllLinks(knex) {
        return knex
            .select('*')
            .from('link')
    },
    getById(knex, id) {
        return knex
            .from('link')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteLink(knex, id) {
        return knex('link')
            .where({ id })
            .delete()
    },
    updateLink(knex, id, newItemFields) {
        return knex('link')
            .where({ id })
            .update(newItemFields)
    },
    insertLink(knex, newLink) {
        return knex
            .insert(newLink)
            .into('link')
            .returning('*')
            .then(rows => rows[0])
    },
}

module.exports = LinkService