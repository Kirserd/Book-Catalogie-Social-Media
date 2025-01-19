const pool = require('../models/db');
const { v4: uuidv4 } = require('uuid');

exports.addNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }

    const { book_id } = req.params;
    const { content } = req.body;
    const note_id = uuidv4(); // Generate a unique ID for the note
    const author = req.session.userId;
    const published = new Date();

    try {
        const query = `
            INSERT INTO book_notes (book_id, note_id, content, author, published)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [book_id, note_id, content, author, published];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Note added successfully',
            note: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ error: 'Failed to add note' });
    }
};

exports.editNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }

    const { book_id, note_id } = req.params;
    const { content } = req.body;

    try {
        const query = `
            UPDATE book_notes
            SET content = $1
            WHERE book_id = $2 AND note_id = $3 AND author = $4
            RETURNING *;
        `;
        const values = [content, book_id, note_id, req.session.userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Note not found or unauthorized' });
        }

        res.status(200).json({
            message: 'Note updated successfully',
            note: result.rows[0],
        });
    } catch (error) {
        console.error('Error editing note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

exports.deleteNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }

    const { book_id, note_id } = req.params;

    try {
        const query = `
            DELETE FROM book_notes
            WHERE book_id = $1 AND note_id = $2 AND author = $3
            RETURNING *;
        `;
        const values = [book_id, note_id, req.session.userId];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Note not found or unauthorized' });
        }

        res.status(200).json({
            message: 'Note deleted successfully',
            note: result.rows[0],
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};

exports.getBookNotes = async (req, res) => {
    const { book_id } = req.params;

    try {
        const query = `
            SELECT 
                bn.note_id, 
                bn.content, 
                u.nickname AS author, 
                TO_CHAR(bn.published, 'HH24:MI') AS time_part,
                TO_CHAR(bn.published, 'DD.MM.YYYY') AS date_part
            FROM book_notes bn
            INNER JOIN users u ON bn.author = u.user_id
            WHERE bn.book_id = $1
            ORDER BY bn.published DESC
        `;
        const result = await pool.query(query, [book_id]);

        if (result.rowCount === 0) {
            return res.status(200).json({ 
                success: true, 
                notes: [], 
                message: 'No notes found for this book' 
            });
        }

        // Format each note with HTML elements
        const formattedNotes = result.rows.map(note => ({
            note_id: note.note_id,
            content: note.content || '',
            author: note.author || 'Unknown Author',
            published: `
                <p class="hh-mm">${note.time_part || 'Unknown Time'}</p>
                <hr class="date-separator" />
                <p class="dd-mm-yyyy">${note.date_part || 'Unknown Date'}</p>
            `,
        }));

        res.status(200).json({ 
            success: true, 
            notes: formattedNotes 
        });
    } catch (error) {
        console.error('Error fetching book notes:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch book notes' 
        });
    }
};
  
exports.getUserBookNotes = async (req, res) => {
    const { book_id, user_id } = req.params;
  
    try {
        const query = `
            SELECT note_id, content, published
            FROM book_notes
            WHERE book_id = $1 AND author = $2
            ORDER BY published ASC
        `;
        const result = await pool.query(query, [book_id, user_id]);
  
        if (result.rowCount === 0) {
            return res.status(200).json({ success: true, notes: [], message: 'No notes found for this user and book' });
        }
  
        res.status(200).json({ success: true, notes: result.rows });
    } catch (error) {
        console.error('Error fetching user book notes:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user book notes' });
    }
};
