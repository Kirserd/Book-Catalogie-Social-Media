const pool = require('../models/db');

exports.addFriend = async (req, res) => {
    const { friend_id } = req.body;

    try {
        const query = `
            UPDATE user_friends
            SET friends = array_append(friends, $2)
            WHERE user_id = $1;

            UPDATE user_friends
            SET friends = array_append(friends, $1)
            WHERE user_id = $2;

            -- If the user does not exist in user_friends, insert a new row
            INSERT INTO user_friends (user_id, friends)
            SELECT $1, ARRAY[$2]
            WHERE NOT EXISTS (SELECT 1 FROM user_friends WHERE user_id = $1);

            -- If the friend does not exist in user_friends, insert a new row
            INSERT INTO user_friends (user_id, friends)
            SELECT $2, ARRAY[$1]
            WHERE NOT EXISTS (SELECT 1 FROM user_friends WHERE user_id = $2);
        `;

        await pool.query(query, [req.session.userId, friend_id]);

        res.status(200).send({ success: true, message: 'Friend added successfully!' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send({ success: false, message: 'Failed to add friend.' });
    }
};
exports.removeFriend = async (req, res) => {
    const { friend_id } = req.params;

    try {
        const query = `
            UPDATE user_friends
            SET friends = array_remove(friends, $2)
            WHERE user_id = $1;
        `;

        await pool.query(query, [req.session.userId, friend_id]);

        const friendQuery = `            
            UPDATE user_friends
            SET friends = array_remove(friends, $1)
            WHERE user_id = $2;
        `;

        await pool.query(friendQuery, [req.session.userId, friend_id]);

        res.status(200).send({ success: true, message: 'Friend removed successfully!' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send({ success: false, message: 'Failed to remove friend.' });
    }
};

exports.getFriendList = async (req, res) => {
    try {
        const query = `
            SELECT users.user_id, users.nickname, users.email, user_prefs.profile_picture
            FROM user_friends
            JOIN users ON users.user_id = ANY(user_friends.friends)
            LEFT JOIN user_prefs ON user_prefs.user_id = users.user_id
            WHERE user_friends.user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).send({ success: false, message: 'Failed to fetch friend list.' });
    }
};
exports.getFriendRequests = async (req, res) => {
    try {
        const query = `
            SELECT friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        if (result.rowCount === 0 || !result.rows[0].friend_requests) {
            return res.status(200).json([]);
        }

        const friendRequests = result.rows[0].friend_requests;
        const queryDetails = `
            SELECT user_id, email, nickname
            FROM users
            WHERE user_id = ANY($1::TEXT[])
        `;
        const detailsResult = await pool.query(queryDetails, [friendRequests]);

        res.status(200).json(detailsResult.rows);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch friend requests.' });
    }
};

exports.sendFriendRequest = async (req, res) => {
    const { friend_id } = req.params;

    try {
        if (req.session.userId === friend_id) {
            return res.status(400).send({ success: false, message: 'You cannot send a friend request to yourself.' });
        }

        const query = `
            SELECT friend_requests FROM user_friends WHERE user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        if (result.rows.length === 0) {
            return res.status(404).send({ success: false, message: 'User not found.' });
        }

        const friendRequests = result.rows[0].friend_requests;

        if (friendRequests.includes(friend_id)) {
            return res.status(400).send({ success: false, message: 'Friend request already sent.' });
        }   

        const updateFriendQuery = `
            UPDATE user_friends
            SET friend_requests = array_append(friend_requests, $1)
            WHERE user_id = $2
        `;
        await pool.query(updateFriendQuery, [req.session.userId, friend_id]);

        res.status(200).send({ success: true, message: 'Friend request sent successfully!' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to send friend request.' });
    }
};
exports.acceptFriendRequest = async (req, res) => {
    const { friend_id } = req.params;

    try {
        const query = `
            SELECT friends, friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        if (result.rowCount === 0) {
            return res.status(404).send({ success: false, message: 'User not found.' });
        }

        const { friends, friend_requests } = result.rows[0];

        if (!friend_requests || !friend_requests.includes(friend_id)) {
            return res.status(404).send({ success: false, message: 'No pending friend request found.' });
        }

        const updatedFriends = [...friends, friend_id];
        const updatedRequests = friend_requests.filter(request => request !== friend_id);

        const updateQuery = `
            UPDATE user_friends
            SET friends = $1, friend_requests = $2
            WHERE user_id = $3
        `;
        await pool.query(updateQuery, [updatedFriends, updatedRequests, req.session.userId]);

         const receiverQuery = `
            SELECT friends
            FROM user_friends
            WHERE user_id = $1
        `;
        const receiverResult = await pool.query(receiverQuery, [friend_id]);

        if (receiverResult.rowCount === 0) {
            return res.status(404).send({ success: false, message: 'Friend not found.' });
        }

        const { friends: receiverFriends } = receiverResult.rows[0];

        const updatedReceiverFriends = [...receiverFriends, req.session.userId];

        await pool.query(updateQuery, [updatedReceiverFriends, receiverFriends, friend_id]);

        res.status(200).send({ success: true, message: 'Friend request accepted and friends added.' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to accept friend request.' });
    }
};
exports.declineFriendRequest = async (req, res) => {
    const { friend_id } = req.params;

    try {
        const query = `
            SELECT friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        const updateQuery = `
            UPDATE user_friends
            SET friend_requests = $1
            WHERE user_id = $2
        `;
        if (result.rowCount > 0) {
            const receiverRequests = result.rows[0].friend_requests || [];
            const updatedReceiverRequests = receiverRequests.filter(request => request !== friend_id);
            await pool.query(updateQuery, [updatedReceiverRequests, req.session.userId]);
        }

        res.status(200).send({ success: true, message: 'Friend request canceled successfully.' });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to cancel friend request.' });
    }
};
exports.cancelFriendRequest = async (req, res) => {
    const { friend_id } = req.params;

    try {
        const receiverQuery = `
            SELECT friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const receiverResult = await pool.query(receiverQuery, [friend_id]);

        const updateQuery = `
            UPDATE user_friends
            SET friend_requests = $1
            WHERE user_id = $2
        `;
        if (receiverResult.rowCount > 0) {
            const receiverRequests = receiverResult.rows[0].friend_requests || [];
            const updatedReceiverRequests = receiverRequests.filter(request => request !== req.session.userId);
            await pool.query(updateQuery, [updatedReceiverRequests, friend_id]);
        }

        res.status(200).send({ success: true, message: 'Friend request canceled successfully.' });
    } catch (error) {
        console.error('Error canceling friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to cancel friend request.' });
    }
};

exports.getMutualFriends = async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `
            SELECT users.id, users.email, users.profile_picture
            FROM user_friends AS uf1
            JOIN user_friends AS uf2 ON uf1.friend_id = uf2.friend_id
            JOIN users ON uf2.friend_id = users.id
            WHERE uf1.user_id = $1 AND uf2.user_id = $2
        `;
        const result = await pool.query(query, [req.session.userId, user_id]);
        const mutualFriends = result.rows;

        res.status(200).send({ mutualFriends });
    } catch (error) {
        console.error('Error fetching mutual friends:', error);
        res.status(500).send({ success: false, message: 'Failed to fetch mutual friends.' });
    }
};
exports.searchUsersByNickname = async (req, res) => {
    const { nickname } = req.query;

    if (!nickname) {
        return res.status(400).json({ success: false, message: 'Nickname is required for search.' });
    }

    try {
        const query = `
            SELECT user_id, nickname, email
            FROM users
            WHERE LOWER(nickname) LIKE LOWER($1)
              AND user_id != $2
            ORDER BY SIMILARITY(nickname, $1) DESC
            LIMIT 8;
        `;
        const usersResult = await pool.query(query, [`%${nickname}%`, req.session.userId]);

        const users = usersResult.rows;

        if (users.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch friend status for each user in parallel
        const statuses = await Promise.all(
            users.map(async (user) => {
                const statusQuery = `
                    SELECT friends, friend_requests
                    FROM user_friends
                    WHERE user_id = $1
                `;
                const statusResult = await pool.query(statusQuery, [req.session.userId]);
        
                if (statusResult.rowCount === 0) {
                    return "not_friend";
                }
        
                const { friends, friend_requests } = statusResult.rows[0];
        
                // Check if the logged-in user is friends with the other user
                if (friends && friends.includes(user.user_id)) {
                    return "friend";
                }
        
                // Check if the other user has the logged-in user in their friend requests (i.e., the logged-in user sent the request)
                const friendRequestQuery = `
                    SELECT friend_requests
                    FROM user_friends
                    WHERE user_id = $1
                `;
                const friendRequestResult = await pool.query(friendRequestQuery, [user.user_id]);
        
                if (friendRequestResult.rowCount === 0) {
                    return "not_friend";
                }
        
                const { friend_requests: otherUserRequests } = friendRequestResult.rows[0];
        
                if (otherUserRequests && otherUserRequests.includes(req.session.userId)) {
                    return "requested";  // The logged-in user has sent a request to this user
                }
        
                return "not_friend";  // No relationship
            })
        );

        // Attach statuses to users
        const resultWithStatus = users.map((user, index) => ({
            ...user,
            status: statuses[index],
        }));

        res.status(200).json(resultWithStatus);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ success: false, message: 'Failed to search users.' });
    }
};
exports.getFriendStatus = async (req, res) => {
    const { friend_id } = req.params;

    try {
        // Check the friend status of the logged-in user
        const query = `
            SELECT friends, friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        if (result.rowCount === 0) {
            return res.status(200).json({ status: "not_friend" });
        }

        const { friends, friend_requests } = result.rows[0];

        // Check if the current user is friends with the other user
        if (friends && friends.includes(friend_id)) {
            return res.status(200).json({ status: "friend" });
        }

        // Check if the current user has been requested by the other user
        const friendRequestQuery = `
            SELECT friend_requests
            FROM user_friends
            WHERE user_id = $1
        `;
        const friendRequestResult = await pool.query(friendRequestQuery, [friend_id]);

        if (friendRequestResult.rowCount === 0) {
            return res.status(200).json({ status: "not_friend" });
        }

        const { friend_requests: otherUserRequests } = friendRequestResult.rows[0];

        if (otherUserRequests && otherUserRequests.includes(req.session.userId)) {
            return res.status(200).json({ status: "requested" });
        }

        return res.status(200).json({ status: "not_friend" });

    } catch (error) {
        console.error('Error fetching friend status:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch friend status.' });
    }
};

exports.getMessages = async (req, res) => {
    const { friend_id } = req.params;
    const my_id = req.session.userId;

    try {
        const client = await pool.connect();
        const getMessagesQuery = `
            SELECT 
                m.message_id, 
                m.sender_id, 
                m.receiver_id, 
                m.content, 
                m.timestamp, 
                u.nickname AS sender_nickname
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE 
                (m.sender_id = $1 AND m.receiver_id = $2)
                OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.timestamp ASC;
        `;

        const result = await client.query(getMessagesQuery, [my_id, friend_id]);

        const messages = result.rows.map(row => ({
            message_id: row.message_id,
            sender_id: row.sender_id,
            sender_nickname: row.sender_nickname,
            receiver_id: row.receiver_id,
            content: row.content,
            timestamp: new Date(row.timestamp).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
        }));

        client.release();

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve messages." });
    }
};
exports.addMessage = async (req, res) => {
    const { friend_id } = req.params;
    const { content } = req.body;
    const my_id = req.session.userId;

    if (!friend_id || !content || !my_id) {
        return res.status(400).json({ success: false, message: "Invalid friend ID, content, or user ID." });
    }

    if (my_id === friend_id) {
        return res.status(400).json({ message: "You cannot send a message to yourself." });
      }
    
      try {
        // Insert the new message into the messages table
        const query = `
          INSERT INTO messages (sender_id, receiver_id, content)
          VALUES ($1, $2, $3)
          RETURNING message_id, sender_id, receiver_id, content, timestamp;
        `;
        const values = [my_id, friend_id, content];
    
        const result = await pool.query(query, values);
    
        // Respond with the created message
        const message = result.rows[0];
        res.status(201).json({
          message: "Message sent successfully.",
          data: message,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while sending the message." });
      }
};

exports.removeMessage = async (req, res) => {
    const { friend_id, message_id } = req.body;
    const my_id = req.session.userId;

    if (!friend_id || !message_id || !my_id) {
        return res.status(400).json({ success: false, message: "Invalid friend ID, message ID, or user ID." });
    }

    // Determine table name
    const tableName = `messages_${Math.min(my_id, friend_id)}_${Math.max(my_id, friend_id)}`;

    try {
        const client = await pool.connect();

        // Delete the message
        const deleteMessageQuery = `
            DELETE FROM ${tableName} 
            WHERE message_id = $1 AND sender_id = $2
            RETURNING message_id;
        `;
        const result = await client.query(deleteMessageQuery, [message_id, my_id]);

        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Message not found or not authorized to delete." });
        }

        res.status(200).json({ success: true, message: "Message removed successfully." });
    } catch (error) {
        console.error("Error removing message:", error);
        res.status(500).json({ success: false, message: "Failed to remove message." });
    }
};
exports.editMessage = async (req, res) => {
    const { friend_id, message_id, newContent } = req.body;
    const my_id = req.session.userId;

    if (!friend_id || !message_id || !newContent || !my_id) {
        return res.status(400).json({ success: false, message: "Invalid data provided." });
    }

    // Determine table name
    const tableName = `messages_${Math.min(my_id, friend_id)}_${Math.max(my_id, friend_id)}`;

    try {
        const client = await pool.connect();

        // Update the message
        const updateMessageQuery = `
            UPDATE ${tableName} 
            SET content = $1
            WHERE message_id = $2 AND sender_id = $3
            RETURNING message_id, content, timestamp, sender_id;
        `;
        const result = await client.query(updateMessageQuery, [newContent, message_id, my_id]);

        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Message not found or not authorized to edit." });
        }

        res.status(200).json({ success: true, message: result.rows[0] });
    } catch (error) {
        console.error("Error editing message:", error);
        res.status(500).json({ success: false, message: "Failed to edit message." });
    }
};
