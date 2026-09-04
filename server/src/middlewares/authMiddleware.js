const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { isInMemory, getMemoryStore } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    if (isInMemory()) {
      const memoryStore = getMemoryStore();
      const user = memoryStore.users.get(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User account no longer exists.' });
      }
      req.user = {
        _id: user._id,
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Authentication error: ' + error.message });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

module.exports = {
  authenticate,
  requireAdmin,
};
