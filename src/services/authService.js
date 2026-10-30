const bcrypt = require('bcrypt');
const { AdminModel } = require('../models/adminModel');

const AuthService = {
  async authenticate(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const admin = await AdminModel.findByEmail(email);
    if (!admin) {
      return null;
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return null;
    }

    return {
      admin_id: admin.admin_id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };
  }
};

module.exports = { AuthService };

