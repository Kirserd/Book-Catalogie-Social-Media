const pool = require('../models/db');

exports.addFriend = async (req, res) => {
    const { friend_id } = req.body;

    try {
        const query = `
            INSERT INTO user_friends (user_id, friend_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, friend_id) DO NOTHING
        `;
        await pool.query(query, [req.session.userId, friend_id]);
        res.status(200).send({ success: true, message: 'Friend added successfully!' });
    } catch (error) {
        console.error('Error adding friend:', error);
        res.status(500).send({ success: false, message: 'Failed to add friend.' });
    }
};
exports.removeFriend = async (req, res) => {
    const { friend_id } = req.body;
    console.log(friend_id);
    try {
        const query = `
            DELETE FROM user_friends
            WHERE user_id = $1 AND friend_id = $2
        `;
        await pool.query(query, [req.session.userId, friend_id]);
        res.status(200).send({ success: true, message: 'Friend removed successfully!' });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).send({ success: false, message: 'Failed to remove friend.' });
    }
};
exports.isFriend = async (req, res) => {
    const { friend_id } = req.params;

    try {
        const query = `
            SELECT 1
            FROM user_friends
            WHERE user_id = $1 AND friend_id = $2
        `;
        const result = await pool.query(query, [req.session.userId, friend_id]);
        const isFriend = result.rowCount > 0;

        res.status(200).send({ isFriend });
    } catch (error) {
        console.error('Error checking friendship:', error);
        res.status(500).send({ success: false, message: 'Failed to check friendship.' });
    }
};
exports.getFriendList = async (req, res) => {
    try {
        const query = `
            SELECT users.id, users.email, users.profile_picture
            FROM user_friends
            JOIN users ON user_friends.friend_id = users.id
            WHERE user_friends.user_id = $1
        `;
        const result = await pool.query(query, [req.session.userId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching friend list:', error);
        res.status(500).send({ success: false, message: 'Failed to fetch friend list.' });
    }
};
exports.getFriendRequests = async (req, res) => {
    try {
        const query = `
            SELECT users.id, users.email, users.profile_picture
            FROM friend_requests
            JOIN users ON friend_requests.sender_id = users.id
            WHERE friend_requests.receiver_id = $1 AND friend_requests.status = 'pending'
        `;
        const result = await pool.query(query, [req.session.userId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch friend requests.' });
    }
};
exports.sendFriendRequest = async (req, res) => {
    const { friend_id } = req.body;

    try {
        if (req.session.userId === friend_id) {
            return res.status(400).send({ success: false, message: 'You cannot send a friend request to yourself.' });
        }
        console.log(friend_id);
        const query = `
            INSERT INTO friend_requests (sender_id, receiver_id, status)
            VALUES ($1, $2, 'pending')
            ON CONFLICT (sender_id, receiver_id) DO NOTHING
        `;
        await pool.query(query, [req.session.userId, friend_id]);
        res.status(200).send({ success: true, message: 'Friend request sent successfully!' });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to send friend request.' });
    }
};
exports.acceptFriendRequest = async (req, res) => {
    const { sender_id } = req.body;

    try {
        // Check if the friend request exists and is pending
        const query = `
            DELETE FROM friend_requests
            WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
        `;
        const result = await pool.query(query, [sender_id, req.session.userId]);
        
        if (result.rowCount === 0) {
            return res.status(404).send({ success: false, message: 'No pending friend request found.' });
        }

        // Add the users as friends in the user_friends table
        const insertFriendQuery = `
            INSERT INTO user_friends (user_id, friend_id)
            VALUES ($1, $2), ($2, $1)
            ON CONFLICT (user_id, friend_id) DO NOTHING
        `;
        await pool.query(insertFriendQuery, [req.session.userId, sender_id]);

        res.status(200).send({ success: true, message: 'Friend request accepted and friends added.' });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to accept friend request.' });
    }
};
exports.declineFriendRequest = async (req, res) => {
    const { sender_id } = req.body;

    try {
        // Check if the friend request exists and is pending
        const query = `
            DELETE FROM friend_requests
            WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
        `;
        const result = await pool.query(query, [sender_id, req.session.userId]);

        if (result.rowCount === 0) {
            return res.status(404).send({ success: false, message: 'No pending friend request found.' });
        }

        res.status(200).send({ success: true, message: 'Friend request declined.' });
    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).send({ success: false, message: 'Failed to decline friend request.' });
    }
};
exports.cancelFriendRequest = async (req, res) => {
    const { receiver_id } = req.body;
    try {
        const query = `
            SELECT * FROM friend_requests
            WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
        `;
        const result = await pool.query(query, [req.session.userId, receiver_id]);

        if (result.rowCount === 0) {
            return res.status(404).send({ success: false, message: 'No pending friend request found.' });
        }
        // Delete the pending friend request
        const deleteQuery = `
            DELETE FROM friend_requests
            WHERE sender_id = $1 AND receiver_id = $2
        `;
        await pool.query(deleteQuery, [req.session.userId, receiver_id]);

        res.status(200).send({ success: true, message: 'Friend request canceled.' });
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
exports.searchUsersByEmail = async (req, res) => {
    const { email } = req.query;
    try {
        const query = `
            SELECT DISTINCT ON (users.email) users.id, users.email, users.profile_picture, 
                CASE 
                    WHEN user_friends.friend_id IS NOT NULL THEN 'friend'
                    WHEN (friend_requests.sender_id = users.id AND friend_requests.receiver_id = $1 AND friend_requests.status = 'pending')
                         OR (friend_requests.receiver_id = users.id AND friend_requests.sender_id = $1 AND friend_requests.status = 'pending') 
                         THEN 'requested'
                    ELSE 'not_friend'
                END AS status
            FROM users
            LEFT JOIN user_friends 
                ON users.id = user_friends.friend_id AND user_friends.user_id = $1
            LEFT JOIN friend_requests 
                ON (users.id = friend_requests.sender_id AND friend_requests.receiver_id = $1)
                OR (users.id = friend_requests.receiver_id AND friend_requests.sender_id = $1)
            WHERE users.email LIKE $2
            AND users.id != $1
            ORDER BY users.email, users.id  -- Ensures only the first record for each email is returned
        `;
        const result = await pool.query(query, [req.session.userId, `%${email}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ success: false, message: 'Failed to search users.' });
    }
};
exports.getMessages = async (req, res) => {
    const { friend_id } = req.query;
    const my_id = req.session.userId;

    if (!friend_id || !my_id) {
        return res.status(400).json({ success: false, message: "Invalid friend ID or user ID." });
    }

    // Determine table name
    const tableName = `messages_${Math.min(my_id, friend_id)}_${Math.max(my_id, friend_id)}`;

    try {
        const client = await pool.connect();

        // Check if the table exists
        const checkTableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            );
        `;
        const tableExistsResult = await client.query(checkTableQuery, [tableName]);
        const tableExists = tableExistsResult.rows[0].exists;

        if (!tableExists) {
            const createTableQuery = `
                CREATE TABLE ${tableName} (
                    message_id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sender_id INT NOT NULL REFERENCES users(id)
                );
            `;
            await client.query(createTableQuery);
        }

        // Query messages and include sender's email
        const getMessagesQuery = `
            SELECT m.message_id, m.content, m.timestamp, m.sender_id, u.email
            FROM ${tableName} m
            JOIN users u ON m.sender_id = u.id
            ORDER BY m.timestamp ASC;
        `;
        const messagesResult = await client.query(getMessagesQuery);

        client.release();

        // Return messages with sender email
        const messages = messagesResult.rows.map(row => ({
            message_id: row.message_id,
            content: row.content,
            timestamp: row.timestamp,
            sender_id: row.sender_id,
            email: row.email
        }));

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve messages." });
    }
};
exports.addMessage = async (req, res) => {
    const { friend_id, content } = req.body;
    const my_id = req.session.userId;

    if (!friend_id || !content || !my_id) {
        return res.status(400).json({ success: false, message: "Invalid friend ID, content, or user ID." });
    }

    // Determine table name
    const tableName = `messages_${Math.min(my_id, friend_id)}_${Math.max(my_id, friend_id)}`;

    try {
        const client = await pool.connect();

        // Check if the table exists
        const checkTableQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            );
        `;
        const tableExistsResult = await client.query(checkTableQuery, [tableName]);
        const tableExists = tableExistsResult.rows[0].exists;

        if (!tableExists) {
            // Create the table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE ${tableName} (
                    message_id SERIAL PRIMARY KEY,
                    content TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    sender_id INT NOT NULL REFERENCES users(id)
                );
            `;
            await client.query(createTableQuery);
        }

        // Insert new message
        const insertMessageQuery = `
            INSERT INTO ${tableName} (content, sender_id)
            VALUES ($1, $2)
            RETURNING message_id, content, timestamp, sender_id;
        `;
        const result = await client.query(insertMessageQuery, [content, my_id]);

        client.release();

        res.status(200).json({ success: true, message: result.rows[0] });
    } catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ success: false, message: "Failed to add message." });
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