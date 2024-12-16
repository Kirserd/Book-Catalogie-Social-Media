const fs = require('fs');
const path = require('path');
const pool = require('../models/db');
const bcrypt = require('bcrypt');
const axios = require('axios');

exports.signUpUser = async (req, res) => {
    const logFilePath = path.join(__dirname, '../logs/usage.log');
    const { email, password } = req.body;  

    if (!email || !password) {
        console.error("Email or password missing");
        return res.render('signup', { errorMessage: "Please provide both email and password." });
    }

    let logMessage = "";

    try {
        const emailCheckQuery = `SELECT * FROM users WHERE email = $1`;
        const emailCheckResult = await pool.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.render('signup', { errorMessage: "Email already exists. Please try another." });
        }

        logMessage = `[${new Date().toISOString()}] Attempting sign-up with email: ${email}\n`;
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) console.error("Failed to write log:", err);
        });

        const newUser = await signUpUser(email, password, "none");

        logMessage = `[${new Date().toISOString()}] SIGN UP QUERY RESULT: SUCCESS\n`;
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) console.error("Failed to write log:", err);
        });

        res.redirect('/auth');
    } catch (error) {
        console.error("Error signing up user:", error);
        res.render('signup', { errorMessage: "An error occurred. Please try again." });

        logMessage = `[${new Date().toISOString()}] SIGN UP QUERY RESULT: FAILURE : ${error.message}\n`;
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) console.error("Failed to write log:", err);
        });
    }
};
async function signUpUser(email, password, profilePicture) {
    const hashedPassword = await bcrypt.hash(password, 10); 
    const query = `
        INSERT INTO users (email, password, profile_picture)
        VALUES ($1, $2, $3)
        RETURNING id, email;
    `;
    const values = [email, hashedPassword, profilePicture];
    const result = await pool.query(query, values);

    return result.rows[0];
}

exports.signInUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('signin', { errorMessage: "Please enter both email and password." });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const userResult = await pool.query(userQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.render('signin', { errorMessage: "Invalid email or password." });
        }

        const user = userResult.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.render('signin', { errorMessage: "Invalid email or password." });
        }

        req.session.userId = user.id;
        req.session.email = user.email;

        res.redirect('/dashboard');

    } catch (error) {
        console.error("Error during sign in:", error);
        res.render('signin', { errorMessage: "An error occurred. Please try again." });
    }
};

exports.dashboard = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }

    try {
        const userQuery = 'SELECT id, email, profile_picture FROM users WHERE id = $1';
        const userResult = await pool.query(userQuery, [req.session.userId]);

        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];

            const booksQuery = `
                SELECT google_books_id
                FROM user_books
                WHERE user_id = $1
                ORDER BY added_at DESC;
            `;
            const booksResult = await pool.query(booksQuery, [req.session.userId]);

            const googleBooksIds = booksResult.rows.map(book => book.google_books_id);
            const books = [];

            for (const googleBooksId of googleBooksIds) {
                try {
                    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleBooksId}`);
                    const book = response.data.volumeInfo;

                    books.push({
                        id: googleBooksId,
                        title: book.title || 'No Title',
                        author: book.authors ? book.authors.join(', ') : 'No Author',
                        cover: book.imageLinks ? book.imageLinks.thumbnail : 'default-cover.jpg',
                        genre: book.categories ? book.categories.join(', ') : 'No Genre',
                        publishedYear: book.publishedDate || 'Unknown',
                        rating: book.averageRating || 'No Rating'
                    });
                } catch (error) {
                    console.error('Error fetching book data:', error);
                }
            }

            res.render('dashboard', { user, books });
        } else {
            res.redirect('/auth'); 
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.redirect('/auth'); 
    }
};