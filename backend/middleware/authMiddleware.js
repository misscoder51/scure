// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decodedToken = jwt.verify(token, 'secretKey');
    req.userId = decodedToken.userId;
    // No need to check user role
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
