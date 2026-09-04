const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const env = require('../config/env');
const { isInMemory, getMemoryStore } = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async ({ name, email, password, role, department }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    for (const u of memoryStore.users.values()) {
      if (u.email === normalizedEmail) {
        throw new Error('An account with this email already exists.');
      }
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    const newUser = {
      _id: userId,
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'student',
      department: department || 'General',
      createdAt: new Date(),
    };

    memoryStore.users.set(userId, newUser);
    const token = generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
      },
      token,
    };
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: role || 'student',
    department: department || 'General',
  });

  const token = generateToken(user);
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    let found = null;
    for (const u of memoryStore.users.values()) {
      if (u.email === normalizedEmail) {
        found = u;
        break;
      }
    }

    if (!found) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, found.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    found.lastLogin = new Date();
    const token = generateToken(found);

    return {
      user: {
        id: found.id || found._id.toString(),
        name: found.name,
        email: found.email,
        role: found.role,
        department: found.department,
      },
      token,
    };
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);
  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };
};

const getProfile = async (userId) => {
  if (isInMemory()) {
    const memoryStore = getMemoryStore();
    const user = memoryStore.users.get(userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
    };
  }

  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    createdAt: user.createdAt,
  };
};

module.exports = {
  register,
  login,
  getProfile,
  generateToken,
};
