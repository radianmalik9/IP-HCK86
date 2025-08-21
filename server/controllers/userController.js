const { User } = require('../models');
const { Op } = require('sequelize');
const { signToken } = require('../helper/jwt');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../helper/mailer');
const admin = require('firebase-admin');
// Ensure firebase-admin is initialized if envs are present
require('../helper/firebase');
const axios = require('axios');

class UserController {
  static async register(req, res, next) {
    try {
      const { email, password, fullName, role = 'student' } = req.body;

      const user = await User.create({
        email,
        password,
        fullName,
        role
      });

      // Send verification email (non-blocking)
      try {
        const token = UserController.buildActionToken({ sub: user.id, type: 'verify' }, '1d');
        const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
        const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

        await sendMail({
          to: email,
          subject: 'Verify your email for Smart Learning Platform',
          html: `
            <h1>Welcome, ${fullName}!</h1>
            <p>Thanks for registering at Smart Learning Platform.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <p>
              <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a>
            </p>
            <p>Or copy this link into your browser:</p>
            <p><a href="${verifyUrl}" target="_blank">${verifyUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
          `,
        });
      } catch (mailErr) {
        console.warn('Verification email skipped:', mailErr?.message);
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw { name: 'BadRequest', message: 'Email and password are required' };
      }

      const user = await User.findOne({ where: { email } });

      if (!user || !user.checkPassword(password)) {
        throw { name: 'Unauthorized', message: 'Invalid email or password' };
      }

      const token = signToken({ id: user.id, email: user.email });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profilePicture: user.profilePicture
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { fullName, phoneNumber, birthDate, bio, learningPreferences } = req.body;

      const payload = {};
      if (fullName !== undefined) payload.fullName = fullName;
      if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber;
      if (birthDate !== undefined) {
        // Accept YYYY-MM-DD; coerce empty string to null
        if (birthDate === '' || birthDate === null) {
          payload.birthDate = null;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(birthDate))) {
          payload.birthDate = birthDate;
        } else {
          // invalid format -> 400
          throw { name: 'BadRequest', message: 'Invalid birthDate format. Use YYYY-MM-DD.' };
        }
      }
      if (bio !== undefined) payload.bio = bio;
      if (learningPreferences !== undefined) payload.learningPreferences = learningPreferences;

      await User.update(payload, { where: { id: req.user.id } });

      const updatedUser = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) throw { name: 'NotFound', message: 'User not found' };
      await user.destroy();
      res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const where = {};
      if (search) {
        where[Op.or] = [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const result = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          users: result.rows,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(result.count / Number(limit)),
            totalItems: result.count,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleSignIn(req, res, next) {
    try {
      const { idToken } = req.body;
      if (!idToken) throw { name: 'BadRequest', message: 'idToken is required' };

      if (!admin.apps.length) {
        throw { name: 'BadRequest', message: 'Firebase Admin is not configured on the server' };
      }

      const decoded = await admin.auth().verifyIdToken(idToken);
      const email = decoded.email;
      const fullName = decoded.name || email.split('@')[0];
      const picture = decoded.picture || null;

      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          email,
          password: Math.random().toString(36).slice(2),
          fullName,
          role: 'student',
          profilePicture: picture,
          isVerified: true,
        });
      }

      const token = signToken({ id: user.id, email: user.email });
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth 2.0 (without Firebase): exchange auth code for tokens, then get userinfo
  static async googleOAuth(req, res, next) {
    try {
      const { code, redirectUri } = req.body;
      if (!code) {
        throw { name: 'BadRequest', message: 'Missing authorization code' };
      }

      // Allow redirectUri to be omitted by client; fall back to env or sensible default
      const effectiveRedirectUri = redirectUri || process.env.OAUTH_REDIRECT_URI || 'http://localhost:5173/oauth2/callback';

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        const missing = [
          !clientId ? 'GOOGLE_CLIENT_ID' : null,
          !clientSecret ? 'GOOGLE_CLIENT_SECRET' : null,
        ].filter(Boolean).join(', ');
        throw { name: 'BadRequest', message: `Google OAuth is not configured: missing ${missing}` };
      }

      // 1) Exchange code for tokens
      let tokenRes;
      try {
        const form = new URLSearchParams();
        form.append('code', code);
        form.append('client_id', clientId);
        form.append('client_secret', clientSecret);
        form.append('redirect_uri', effectiveRedirectUri);
        form.append('grant_type', 'authorization_code');

        tokenRes = await axios.post('https://oauth2.googleapis.com/token', form.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } catch (err) {
        const detail = err.response?.data?.error_description || err.response?.data?.error || err.message || 'Token exchange failed';
        err.name = 'BadRequest';
        err.message = `Google token exchange failed: ${detail}`;
        throw err;
      }
      const { access_token, id_token } = tokenRes.data;

      // 2) Fetch user info
      let userRes;
      try {
        userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
      } catch (err) {
        const detail = err.response?.data?.error_description || err.response?.data?.error || err.message || 'Userinfo fetch failed';
        err.name = 'BadRequest';
        err.message = `Google userinfo fetch failed: ${detail}`;
        throw err;
      }
      const { email, name, picture } = userRes.data;

      if (!email) throw { name: 'Unauthorized', message: 'Failed to retrieve Google user email' };

      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          email,
          password: Math.random().toString(36).slice(2),
          fullName: name || email.split('@')[0],
          role: 'student',
          profilePicture: picture || null,
          isVerified: true,
        });
      }

      const token = signToken({ id: user.id, email: user.email });
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            profilePicture: user.profilePicture,
          },
          token,
          idToken: id_token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static buildActionToken(payload, expiresIn) {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyActionToken(token) {
    const secret = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, secret);
  }

  static async requestEmailVerification(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) throw { name: 'NotFound', message: 'User not found' };
      if (user.isVerified) {
        return res.status(200).json({ success: true, message: 'Email already verified' });
      }

      const token = this.buildActionToken({ sub: user.id, type: 'verify' }, '1d');
      const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
      const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

      await sendMail({
        to: user.email,
        subject: 'Verify your email',
        html: `
          <p>Hi ${user.fullName},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}" target="_blank">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      res.status(200).json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      if (!token) throw { name: 'BadRequest', message: 'Token is required' };
      const payload = this.verifyActionToken(token);
      if (payload.type !== 'verify') throw { name: 'BadRequest', message: 'Invalid token type' };

      const user = await User.findByPk(payload.sub);
      if (!user) throw { name: 'NotFound', message: 'User not found' };
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      res.status(200).json({ success: true, message: 'Email verified' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        error = { name: 'BadRequest', message: 'Token expired' };
      }
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) throw { name: 'BadRequest', message: 'Email is required' };
      const user = await User.findOne({ where: { email } });
      // Always respond success to avoid email enumeration
      if (user) {
        const token = this.buildActionToken({ sub: user.id, type: 'reset' }, '1h');
        const baseUrl = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
        const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
        try {
          await sendMail({
            to: user.email,
            subject: 'Reset your password',
            html: `
              <p>Hi ${user.fullName},</p>
              <p>You requested to reset your password. Click the link below:</p>
              <p><a href="${resetUrl}" target="_blank">Reset Password</a></p>
              <p>This link will expire in 1 hour. If you did not request this, please ignore.</p>
            `,
          });
        } catch (mailErr) {
          console.warn('Forgot password email skipped:', mailErr?.message);
        }
      }

      res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) throw { name: 'BadRequest', message: 'Token and newPassword are required' };
      if (String(newPassword).length < 6) throw { name: 'BadRequest', message: 'Password must be at least 6 characters' };

      const payload = this.verifyActionToken(token);
      if (payload.type !== 'reset') throw { name: 'BadRequest', message: 'Invalid token type' };

      const user = await User.findByPk(payload.sub);
      if (!user) throw { name: 'NotFound', message: 'User not found' };

      user.password = newPassword; // hashed by hook beforeUpdate
      await user.save();

      res.status(200).json({ success: true, message: 'Password has been reset' });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        error = { name: 'BadRequest', message: 'Token expired' };
      }
      next(error);
    }
  }

  // ===== Generic Users CRUD =====
  // Create user (any authenticated; non-admin can only create student users)
  static async createUser(req, res, next) {
    try {
      const { email, password, fullName, role = 'student', profilePicture, learningPreferences, isVerified } = req.body;
      if (!email || !password || !fullName) {
        throw { name: 'BadRequest', message: 'fullName, email, and password are required' };
      }
      // Only admin can set non-student role; others default to student
      const requestedRole = ['student', 'instructor', 'admin'].includes(role) ? role : 'student';
      const finalRole = req.user?.role === 'admin' ? requestedRole : 'student';

      const exists = await User.findOne({ where: { email } });
      if (exists) throw { name: 'BadRequest', message: 'User with this email already exists' };

      const user = await User.create({
        email,
        password,
        fullName,
        role: finalRole,
        profilePicture: profilePicture || null,
        learningPreferences: learningPreferences || {},
        // Only admin can set isVerified; otherwise false
        isVerified: req.user?.role === 'admin' && typeof isVerified === 'boolean' ? isVerified : false,
      });

      res.status(201).json({
        success: true,
        message: 'User created',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // List users (any authenticated)
  static async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '', role } = req.query;
      const where = {};
      if (role && ['student', 'instructor', 'admin'].includes(role)) where.role = role;
      if (search) {
        where[Op.or] = [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const result = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: Number(limit), 
        offset: (Number(page) - 1) * Number(limit),
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        success: true,
        data: {
          users: result.rows,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(result.count / Number(limit)),
            totalItems: result.count,
            itemsPerPage: Number(limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get user by id (any authenticated)
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      // Anyone logged-in can read any user's public profile (without password)

      const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!user) throw { name: 'NotFound', message: 'User not found' };

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Update user (self basic; admin can change role/isVerified)
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const isSelf = String(req.user.id) === String(id);
      const isAdmin = req.user.role === 'admin';
      if (!isSelf && !isAdmin) throw { name: 'Forbidden', message: 'Access denied' };

      const payload = {};
      const { fullName, password, profilePicture, learningPreferences, role, isVerified } = req.body;
      if (fullName !== undefined) payload.fullName = fullName;
      if (profilePicture !== undefined) payload.profilePicture = profilePicture;
      if (learningPreferences !== undefined) payload.learningPreferences = learningPreferences;
      if (password !== undefined) payload.password = password; // will be hashed by hook
      if (isAdmin) {
        if (role !== undefined) {
          if (!['student', 'instructor', 'admin'].includes(role)) {
            throw { name: 'BadRequest', message: 'Invalid role' };
          }
          payload.role = role;
        }
        if (isVerified !== undefined) payload.isVerified = !!isVerified;
      }

      await User.update(payload, { where: { id } });
      const updated = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!updated) throw { name: 'NotFound', message: 'User not found' };

      res.status(200).json({ success: true, message: 'User updated', data: updated });
    } catch (error) {
      next(error);
    }
  }

  // Delete user (self or admin)
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const isSelf = String(req.user.id) === String(id);
      const isAdmin = req.user.role === 'admin';
      if (!isSelf && !isAdmin) throw { name: 'Forbidden', message: 'Access denied' };
      const user = await User.findByPk(id);
      if (!user) throw { name: 'NotFound', message: 'User not found' };
      await user.destroy();
      res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
