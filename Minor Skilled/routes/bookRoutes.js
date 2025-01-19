const express = require('express');
const bookController = require('../controllers/bookController');
const noteController = require('../controllers/noteController');
const router = express.Router();

// Books
router.get('/books', bookController.searchBooks); // Search books
router.get('/books/:id', bookController.getBookDetails); // Get book details
router.post('/books/:id', bookController.saveBookToUser); // Save book to user collection
router.delete('/books/:id', bookController.removeBookFromUser); // Remove book from user collection
router.get('/books/:id/rating', bookController.getBookRating); // Get book rating
router.get('/books/:id/saved', bookController.isBookSaved); // Get if book is saved by user
router.get('/:user_id/books', bookController.getUsersBookCollection) // Get user's book collection

// Notes
router.get('/books/:book_id/notes', noteController.getBookNotes); // Get notes for a book
router.get('/books/:book_id/:user_id/notes', noteController.getUserBookNotes); // Get user-specific notes for a book
router.post('/books/:book_id/notes', noteController.addNote); // Add note to a book
router.put('/books/:book_id/notes/:note_id', noteController.editNote); // Edit a specific note
router.delete('/books/:book_id/notes/:note_id', noteController.deleteNote); // Delete a specific note

module.exports = router;