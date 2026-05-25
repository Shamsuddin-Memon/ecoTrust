const express = require('express');
const { getUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

const router = express.Router();

// Only Admins can access user management
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
