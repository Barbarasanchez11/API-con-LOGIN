const bcrypt = require('bcrypt');
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
const hashedSecret = bcrypt.hashSync(secret, 10);

module.exports = hashedSecret