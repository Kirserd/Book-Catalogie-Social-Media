const express = require('express');
const friendController = require('../controllers/friendController');
const router = express.Router();

router.post('/friends/:friend_id', ); //...
router.delete('/friends/:friend_id', friendController.removeFriend); // Remove a friend

// Friend Requests
router.post('/friends/:friend_id/request', friendController.sendFriendRequest); // Send a friend request
router.post('/friends/:friend_id/request/accept', friendController.acceptFriendRequest); // Accept a friend request
router.post('/friends/:friend_id/request/decline', friendController.declineFriendRequest); // Decline a friend request
router.post('/friends/:friend_id/request/cancel', friendController.cancelFriendRequest); // Cancel a sent friend request

// Messaging
router.post('/friends/:friend_id/messages', friendController.addMessage); // Add a message to a friend
router.get('/friends/:friend_id/messages', friendController.getMessages); // Get message history with a friend

// Queries
router.get('/friends/:friend_id/status', friendController.getFriendStatus); // Check if a user is a friend
router.get('/friends', friendController.getFriendList); // Get a list of friends
router.get('/friends/requests', friendController.getFriendRequests); // Get a list of incoming friend requests
router.get('/friends/mutual/:user_id', friendController.getMutualFriends); // Get mutual friends
router.get('/friends/search', friendController.searchUsersByNickname); // Search users by email

module.exports = router;