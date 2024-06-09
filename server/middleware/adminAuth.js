const jwt = require('jsonwebtoken');

function checkAdminRights(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.role !== 1) {
            return res.status(403).send('Access denied');
        }
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
}

module.exports = checkAdminRights;