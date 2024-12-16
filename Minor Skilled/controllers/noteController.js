const pool = require('../models/db');

const addNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }
  
    const { book_id, note } = req.body;
  
    try {
        const query = `
            INSERT INTO user_notes (user_id, book_id, note)
            VALUES ($1, $2, $3)
        `;
        await pool.query(query, [req.session.userId, book_id, note]);
        res.redirect(`/book/${book_id}`);
    } catch (error) {
        console.error('Error adding note:', error);
        res.redirect(`/book/${book_id}`);
    }
};
  
const editNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }
  
    const { note_id, note } = req.body;
  
    try {
        const query = `
            UPDATE user_notes
            SET note = $1
            WHERE id = $2 AND user_id = $3
        `;
        await pool.query(query, [note, note_id, req.session.userId]);
        res.redirect('back');
    } catch (error) {
        console.error('Error editing note:', error);
        res.redirect('back');
    }
};
  
const deleteNote = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/auth');
    }
  
    const { note_id } = req.body;
  
    try {
        const query = `
            DELETE FROM user_notes
            WHERE id = $1 AND user_id = $2
        `;
        await pool.query(query, [note_id, req.session.userId]);
        res.redirect('back');
    } catch (error) {
        console.error('Error deleting note:', error);
        res.redirect('back');
    }
};

module.exports = {
    addNote,
    editNote,
    deleteNote,
};