const express = require('express');
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,  // Fixed typo here
  removeFromGroup,
} = require('../controllers/chatControllers');  // Make sure the path is correct
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, accessChat);  // Create or fetch one-to-one chat
router.route('/').get(protect, fetchChats);  // Fetch all chats for a user
router.route('/group').post(protect, createGroupChat);  // Create new group chat
router.route('/rename').put(protect, renameGroup);  // Rename group
router.route('/groupadd').put(protect, addToGroup);  // Add user to group
router.route('/groupremove').put(protect, removeFromGroup);  // Remove user from group

module.exports = router;
