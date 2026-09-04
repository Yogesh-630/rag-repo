const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;
    const result = await authService.register({ name, email, password, role, department });
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      ...result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      ...result,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id || req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
