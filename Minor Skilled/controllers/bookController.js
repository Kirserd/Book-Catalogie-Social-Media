const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pool = require('../models/db');

exports.searchBooks = async (req, res) => {
  let { query, sortBy, page = 1 } = req.query; 
  const maxResults = 40; 
  page = parseInt(page);
  const startIndex = (page - 1) * maxResults; 
  const logFilePath = path.join(__dirname, '../logs/usage.log');
  
  const searchQuery = query ? (sortBy!='intitle'? `${query}`: `${query}+${sortBy || 'intitle'}` ): "UK";

  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&maxResults=${maxResults}&startIndex=${startIndex}`);
    
    const books = response.data.items.map(book => ({
      id: book.id,
      title: book.volumeInfo.title,
      cover: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '',
      author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : 'Unknown',
      publishedYear: book.volumeInfo.publishedDate || 'N/A',
      genre: book.volumeInfo.categories ? book.volumeInfo.categories[0] : 'Unknown',
      rating: book.volumeInfo.averageRating || 'No rating',
    }));

    const totalResults = response.data.totalItems;
    const totalPages = Math.ceil(totalResults / maxResults);

    const logMessage = `[${new Date().toISOString()}] SEARCH QUERY: "${query || 'All books'}" - Page: ${page} - Results: ${books.length}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error("Failed to write log:", err);
    });

    return res.render('search', { books, error: null, page: page, totalPages: totalPages, query: query || '', sortBy: sortBy || 'intitle' });
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] SEARCH QUERY: "${query || 'All books'}" - Error: Failed to fetch books\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) console.error("Failed to write log:", err);
    });

    return res.render('search', { books: null, error: "Failed to fetch books", page: 1, totalPages: 1, query: query || '', sortBy: sortBy || 'intitle' });
  }
};

exports.getBookDetails = async (req, res) => {
  if (!req.session.userId) {
      return res.redirect('/auth');
  }

  const { id } = req.params;

  try {
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
      const book = response.data.volumeInfo;

      const saved = await checkIfBookSaved(req.session.userId, id);
      const bookDetails = {
          id: id,
          title: book.title,
          cover: book.imageLinks ? book.imageLinks.thumbnail : '',
          author: book.authors ? book.authors.join(', ') : 'Unknown',
          publishedYear: book.publishedDate || 'N/A',
          genre: book.categories ? book.categories.join(', ') : 'Unknown',
          rating: book.averageRating || 'No rating',
          description: book.description || 'No description available',
          pageCount: book.pageCount || 'N/A',
          publisher: book.publisher || 'Unknown',
          saved: saved,
      };

      const notesQuery = `
          SELECT id, note
          FROM user_notes
          WHERE user_id = $1 AND book_id = $2
      `;
      const notesResult = await pool.query(notesQuery, [req.session.userId, id]);
      const notes = notesResult.rows;

      res.render('bookDetails', { book: bookDetails, notes: notes, previousPage: req.get('Referer') });
  } catch (error) {
      console.error('Error fetching book details:', error);
      res.render('bookDetails', { book: null, notes: [], previousPage: req.get('Referer'), error: 'Failed to fetch book details' });
  }
};

const checkIfBookSaved = async (userId, googleBooksId) => {
  const query = `
    SELECT * FROM user_books
    WHERE user_id = $1 AND google_books_id = $2
  `;
  const result = await pool.query(query, [userId, googleBooksId]);
  return result.rows.length > 0; 
};

exports.saveBookToUser = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth'); 
  }

  const { google_books_id } = req.body; 

  try {
    const addedAt = new Date();

    const query = `
      INSERT INTO user_books (user_id, added_at, google_books_id)
      VALUES ($1, $2, $3)
    `;
    await pool.query(query, [
      req.session.userId, 
      addedAt,
      google_books_id
    ]);

    return res.redirect(`/book/${google_books_id}`);
  } catch (error) {
    console.error('Error saving book to user_books:', error);
    return res.redirect(`/book/${google_books_id}`);
  }
};

exports.removeBookFromUser = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth'); 
  }

  const { google_books_id } = req.body; 
  console.error('google_books_id:',req.session.userId);
try {
  const query = `
    DELETE FROM user_books
    WHERE user_id = $1 AND google_books_id = $2
    RETURNING id;
  `;
  await pool.query(query, [req.session.userId, google_books_id]);

    return res.redirect(`/book/${google_books_id}`);
  } catch (error) {
    console.error('Error removing book from user_books:', error);
    return res.redirect(`/book/${google_books_id}`);
  }
};