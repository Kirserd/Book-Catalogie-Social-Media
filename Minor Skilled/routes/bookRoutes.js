const express = require('express');
const bookController = require('../controllers/bookController');
const noteController = require('../controllers/noteController');
const router = express.Router();

router.get('/search', bookController.searchBooks);
router.get('/book/:id', bookController.getBookDetails);

router.post('/saveBook', bookController.saveBookToUser);
router.post('/removeBook', bookController.removeBookFromUser);
router.post('/addNote', noteController.addNote);
router.post('/editNote', noteController.editNote);
router.post('/deleteNote', noteController.deleteNote);

module.exports = router;