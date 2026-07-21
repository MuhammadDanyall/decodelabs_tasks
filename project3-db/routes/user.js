const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { validateUserPayload } = require('../middleware/validation');

// CREATE: User and Profile (1:1 relation mapping)
router.post('/', validateUserPayload, userController.createUser);

// READ: Get all users with profiles
router.get('/', userController.getAllUsers);

// READ: Get single user with profile
router.get('/:id', userController.getUserById);

// UPDATE: Update profile (1:1 change)
router.put('/:id', userController.updateUserProfile);

// DELETE: Delete user and cascade profile deletion
router.delete('/:id', userController.deleteUser);

module.exports = router;
