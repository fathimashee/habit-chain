const bcrypt = require('bcrypt');
const { StudentModel } = require('../models/studentModel');

const SALT_ROUNDS = 12;

// Common weak passwords to reject
const WEAK_PASSWORDS = ['password', 'password1', '12345678', '123456789', 'qwerty123'];

const StudentAuthService = {
  async hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  validatePasswordStrength(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters.' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter.' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number.' };
    }
    if (WEAK_PASSWORDS.includes(password.toLowerCase())) {
      return { valid: false, message: 'This password is too common. Please choose a stronger one.' };
    }
    return { valid: true };
  },

  async register({ name, email, password, semester_id }) {
    const existing = await StudentModel.findByEmail(email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const strengthCheck = this.validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return { success: false, message: strengthCheck.message };
    }
    const password_hash = await this.hashPassword(password);
    const studentId = await StudentModel.create({ name, email, password_hash, semester_id });
    return { success: true, studentId };
  },

  async login(email, password) {
    const student = await StudentModel.findByEmail(email);
    if (!student) {
      return { success: false };
    }
    const valid = await this.verifyPassword(password, student.password_hash);
    if (!valid) {
      return { success: false };
    }
    StudentModel.updateLastLogin(student.student_id);
    return { success: true, student };
  },

  // Validate redirect is safe (internal path only, no open redirect)
  isSafeRedirect(url) {
    if (!url) return false;
    // Must start with / but not // (protocol-relative)
    return /^\/[^/]/.test(url) || url === '/';
  }
};

module.exports = { StudentAuthService };

