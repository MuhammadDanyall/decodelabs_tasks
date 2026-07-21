const { prisma } = require('../config/db');

/**
 * CREATE: Create User & UserProfile in an atomic transaction (1:1 relation)
 * POST /api/users
 */
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    // Use Prisma transaction to create user and profile atomically
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password // Stored plain text for training sandbox; in production, use bcrypt/argon2
        }
      });

      const profile = await tx.userProfile.create({
        data: {
          fullName,
          phoneNumber,
          userId: user.id
        }
      });

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          phoneNumber: profile.phoneNumber
        }
      };
    });

    res.status(201).json({
      success: true,
      message: 'User & Profile registered successfully (1:1 Transaction).',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ ALL: Get all users with their profile data joined
 * GET /api/users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * READ ONE: Get single user by ID with profile joined
 * GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE: Update UserProfile (1:1 modification)
 * PUT /api/users/:id
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { fullName, phoneNumber } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID.' });
    }

    // Update profile where userId matches the requested user
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        fullName,
        phoneNumber
      }
    });

    res.status(200).json({
      success: true,
      message: 'User Profile updated successfully.',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE: Delete User & Profile (1:1 Cascade Delete)
 * DELETE /api/users/:id
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID.' });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.status(200).json({
      success: true,
      message: 'User and Profile deleted successfully (1:1 Cascade Delete completed).'
    });
  } catch (error) {
    next(error);
  }
};
