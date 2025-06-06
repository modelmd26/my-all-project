const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) return res.status(401).send('Token is required.');
        
        token = token.split(' ')[1];
        const decoded = jwt.verify(token, 'my_super_secret_key_123!@#');
        req.auth = decoded;
        next();
    } catch (error) {
        res.status(401).send({ message: 'Invalid or expired token.', error });
    }
};
