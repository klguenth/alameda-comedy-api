const bcrypt = require('bcryptjs')
const xss = require('xss')
const knex = require('knex')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithEmail(db, email) {
    return db
      .from('users')
      .where({ email })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user)
  },
  validatePassword(pw) {
    if (pw.length < 3) {
      return 'Password must be longer than 3 characters'
    }
    if (pw.length < 72) {
      return 'Password must be less than 72 characters'
    }
    if (pw.startsWith(' ') || pw.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(pw)) {
      return 'Password must contain at least one upper case, one lower case, one number and one special character'
    }
    return null
  },
  hashPassword(pw) {
    return bcrypt.hash(pw, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      email: xss(user.email),
      date_created: new Date(user.date_created),
    }
  },
}

module.exports = UsersService