const express = require('express');
const friendController = require('../controllers/friendController');
const router = express.Router();

// Add and remove friends
router.post('/addFriend', friendController.addFriend);
router.post('/removeFriend', friendController.removeFriend);

// Send and manage friend requests
router.post('/request', friendController.sendFriendRequest);
router.post('/accept', friendController.acceptFriendRequest);
router.post('/decline', friendController.declineFriendRequest);
router.post('/cancel', friendController.cancelFriendRequest);

router.post('/addMessage', friendController.addMessage);

// Get information about friendships and requests
router.get('/isFriend/:friend_id', friendController.isFriend);
router.get('/getFriendList', friendController.getFriendList);
router.get('/getFriendRequests', friendController.getFriendRequests);
router.get('/search', friendController.searchUsersByEmail);
router.get('/mutualFriends/:user_id', friendController.getMutualFriends);
router.get('/getMessages', friendController.getMessages);

module.exports = router;