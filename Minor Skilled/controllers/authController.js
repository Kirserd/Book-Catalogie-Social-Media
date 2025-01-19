const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const pool = require('../models/db');

exports.signUpUser = async (req, res) => {

    //#region [VARIABLES]

    const logFilePath = path.join(__dirname, '../logs/usage.log');
    let { email, password, nickname } = req.body;

    //#endregion

    //#region [LOCAL FUNCTIONS]

    const truncate = (email) => {
        if (email) {
            return email.split('@')[0]; 
        }
        return '';
    }

    const logMessage = async (message) => {
        const formattedMessage = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFile(logFilePath, formattedMessage, (err) => {
            if (err) console.error("Failed to write log:", err);
        });
    };

    const createUserInDB = async (email, password, nickname) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
        INSERT INTO users (user_id, email, password, nickname)
        VALUES (gen_random_uuid()::varchar(36), $1, $2, $3)
        RETURNING user_id, email, nickname;
        `;
        const values = [email, hashedPassword, nickname];
        const result = await pool.query(query, values);

        await pool.query(
            `INSERT INTO user_prefs (user_id, preferences) VALUES ($1, '{}')`,
            [result.rows[0].user_id]
        );
        await pool.query(
            `INSERT INTO user_collections (user_id, books) VALUES ($1, '{}')`,
            [result.rows[0].user_id]
        );
        await pool.query(
            `INSERT INTO user_friends (user_id, friends, friend_requests) 
            VALUES ($1, '{}', '{}')`,
            [result.rows[0].user_id]
        );

        return result.rows[0];
    };

    //#endregion

    //#region [EXECUTION]

    if(nickname === undefined) {
        nickname = truncate(email);
    }

    if (!email || !password || !nickname) {
        console.error("Email, password, or nickname missing");
        return res.render('signup', { errorMessage: "Please provide email, password, and nickname." });
    }

    try {
        const emailCheckQuery = `SELECT * FROM users WHERE email = $1`;
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.render('signup', { errorMessage: "Email already exists. Please try another." });
        }

        await logMessage(`Attempting sign-up with email: ${email}`);
        const newUser = await createUserInDB(email, password, nickname);
        await logMessage(`SIGN UP QUERY RESULT: SUCCESS for email: ${email}`);
        res.redirect('/auth');
    } catch (error) {
        console.error("Error signing up user:", error);
        res.render('signup', { errorMessage: "An error occurred. Please try again." });
        await logMessage(`SIGN UP QUERY RESULT: FAILURE for email: ${email}. Error: ${error.message}`);
    }

    //#endregion
};

exports.signInUser = async (req, res) => {

    //#region [VARIABLES]

    const { email, password } = req.body;

    //#endregion

    //#region [LOCAL FUNCTIONS]

    const fetchUserFromDB = async (email) => {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    };

    const verifyPassword = async (inputPassword, storedPassword) => {
        return bcrypt.compare(inputPassword, storedPassword);
    };

    //#endregion

    //#region [EXECUTION]

    if (!email || !password) {
        return res.render('signin', { errorMessage: "Please enter both email and password." });
    }

    try {
        const user = await fetchUserFromDB(email);
        if (!user) {
            return res.render('signin', { errorMessage: "Invalid email or password." });
        }

        const isPasswordCorrect = await verifyPassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.render('signin', { errorMessage: "Invalid email or password." });
        }

        req.session.userId = user.user_id;
        req.session.email = user.email;

        res.redirect('/dashboard');
    } catch (error) {
        console.error("Error during sign in:", error);
        res.render('signin', { errorMessage: "An error occurred. Please try again." });
    }

    //#endregion
};

exports.dashboard = async (req, res) => {

    //#region [VARIABLES]

    if (!req.session.userId) {
        return res.redirect('/auth');
    }

    //#endregion

    //#region [LOCAL FUNCTIONS]

    const fetchUserData = async (userId) => {
        const query = 'SELECT user_id, email, nickname FROM users WHERE user_id = $1';
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    };

    //#endregion

    //#region [EXECUTION]

    try {
        const user = await fetchUserData(req.session.userId);
        if (!user) {
            return res.redirect('/auth');
        }

        res.render('dashboard', { user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.redirect('/auth');
    }

    //#endregion
};
