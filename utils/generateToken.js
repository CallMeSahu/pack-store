const jwt = require('jsonwebtoken');

const generateToken = ({ email, userid }) => {
    return jwt.sign({ email, userid }, process.env.JWT_SECRET);
}

module.exports = generateToken;

