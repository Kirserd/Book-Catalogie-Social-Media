const axios = require('axios');
const pool = require('../models/db');

exports.searchBooks = async (req, res) => {

  //#region [VARIABLES]

  const { query, sortBy, direction='DESC', page = 1 } = req.query;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const sortRule = JSON.stringify([{"column": sortBy, "direction": direction}]);

  //#endregion

  //#region [LOCAL FUNCTIONS]

  const parseSortConditions = (sortBy) => {
    if (!sortBy) return null;
    try {
      const sortRules = JSON.parse(sortBy);
      return sortRules.map((rule) => `${rule.column} ${rule.direction.toUpperCase()}`).join(", ");
    } catch (error) {
      console.error("Invalid sortBy format:", error);
      return null;
    }
  };
  const fetchBooksFromDatabase = async (query, sortConditions, pageSize, offset) => {
    const dbQuery = `
      SELECT book_id, title, author, publisher, published, country, rating, full_json
      FROM books
      WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1 OR LOWER(publisher) LIKE $1
      ${sortConditions ? `ORDER BY ${sortConditions}` : ""}
      LIMIT $2 OFFSET $3
    `;
    const dbResult = await pool.query(dbQuery, [`%${query?.toLowerCase() || ""}%`, pageSize, offset]);
    return dbResult.rows;
  };
  const fetchBooksFromAPI = async (query, offset, remaining) => {
    if (!query) return [];
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${offset}&maxResults=${remaining}`;
    const response = await axios.get(apiUrl);
    return response.data.items.map((book) => ({
      book_id: book.id,
      title: book.volumeInfo.title || "Unknown",
      author: book.volumeInfo.authors?.[0] || "Unknown",
      publisher: book.volumeInfo.publisher || "Unknown",
      published: book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate) : null,
      country: response.data.country || "Unknown",
      rating: book.volumeInfo.averageRating || null,
      full_json: book
    }));
  };
  const insertBooksIntoDatabase = async (books) => {
    const insertPromises = books.map((book) =>
      pool.query(
        `
        INSERT INTO books (book_id, title, author, publisher, published, country, rating, full_json)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (book_id) DO NOTHING
      `,
        [book.book_id, book.title, book.author, book.publisher, book.published, book.country, book.rating, book.full_json]
      )
    );
    await Promise.all(insertPromises);
  };

  //#endregion

  //#region [EXECUTION]

  try {
    const sortConditions = parseSortConditions(sortRule);
    const dbBooks = await fetchBooksFromDatabase(query, sortConditions, pageSize, offset);

    const remaining = pageSize - dbBooks.length;
    let apiBooks = [];
    if (remaining > 0) {
      apiBooks = await fetchBooksFromAPI(query, offset, remaining);
      await insertBooksIntoDatabase(apiBooks);
    }

    const combinedBooks = [...dbBooks, ...apiBooks];
    res.json({
      books: combinedBooks,
      page,
      pageSize,
      query,
      totalResults: dbBooks.length + apiBooks.length
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }

  //#endregion

};


exports.getBookDetails = async (req, res) => {
  const { id } = req.params;

  try {
      const query = `
          SELECT title, author, publisher, published, country, rating, full_json
          FROM books
          WHERE book_id = $1
      `;
      const result = await pool.query(query, [id]);

      if (result.rowCount === 0) {
          return res.status(404).json({ success: false, message: 'Book not found' });
      }

      res.status(200).json({ success: true, book: result.rows[0] });
  } catch (error) {
      console.error('Error fetching book details:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch book details' });
  }
};

exports.getBookRating = async (req, res) => {
  const { id } = req.params;

  try {
      const query = `
          SELECT AVG(rating) AS average_rating
          FROM book_ratings
          WHERE book_id = $1
      `;
      const result = await pool.query(query, [id]);

      if (result.rowCount === 0 || result.rows[0].average_rating === null) {
          return res.status(200).json({ success: true, average_rating: null, message: 'No ratings available' });
      }

      res.status(200).json({ success: true, average_rating: result.rows[0].average_rating });
  } catch (error) {
      console.error('Error fetching book rating:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch book rating' });
  }
};


exports.isBookSaved = async (req, res) => {
  const { id } = req.params; 
  const userId = req.session.userId; 

  const query = `
    SELECT 1
    FROM user_collections
    WHERE user_id = $1 AND $2 = ANY(books);
  `;

  try {
    const result = await pool.query(query, [userId, id]);
    const isSaved = result.rows.length > 0;

    res.json({ isBookSaved: isSaved });
  } catch (error) {
    console.error('Error checking if book is saved:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.saveBookToUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;

  try {
      // Check if the user already has a collection
      const queryCheck = `SELECT books FROM user_collections WHERE user_id = $1`;
      const result = await pool.query(queryCheck, [userId]);

      if (result.rows.length === 0) {
          const queryInsert = `
              INSERT INTO user_collections (user_id, books)
              VALUES ($1, ARRAY[$2])
          `;
          await pool.query(queryInsert, [userId, id]);
      } else {
          const books = result.rows[0].books;
          if (!books.includes(id)) {
              const queryUpdate = `
                  UPDATE user_collections
                  SET books = array_append(books, $2)
                  WHERE user_id = $1
              `;
              await pool.query(queryUpdate, [userId, id]);
          }
      }

      res.status(200).json({ message: 'Book saved to collection.' });
  } catch (error) {
      console.error('Error saving book to user collection:', error);
      res.status(500).json({ error: 'Failed to save book to collection.' });
  }
};

exports.removeBookFromUser = async (req, res) => {
  const { id } = req.params; 
  const userId = req.session.userId; 

  try {
      const queryCheck = `SELECT books FROM user_collections WHERE user_id = $1`;
      const result = await pool.query(queryCheck, [userId]);

      if (result.rows.length === 0 || !result.rows[0].books.includes(id)) {
          return res.status(400).json({ error: 'Book not found in user collection.' });
      }

      const queryUpdate = `
          UPDATE user_collections
          SET books = array_remove(books, $2)
          WHERE user_id = $1
      `;
      await pool.query(queryUpdate, [userId, id]);

      res.status(200).json({ message: 'Book removed from collection.' });
  } catch (error) {
      console.error('Error removing book from user collection:', error);
      res.status(500).json({ error: 'Failed to remove book from collection.' });
  }
};

exports.getUsersBookCollection = async (req, res) => {
    //#region [VARIABLES]

    if (!req.session.userId) {
      return res.redirect('/auth');
    }

    //#endregion

    //#region [LOCAL FUNCTIONS]

    const fetchUserBooks = async (userId) => {
        const query = `
        SELECT unnest(books) AS book_id
        FROM user_collections
        WHERE user_id = $1;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows.map((row) => row.book_id);
    };

    const fetchBookDetails = async (bookId) => {
        const query = 'SELECT * FROM books WHERE book_id = $1';
        const result = await pool.query(query, [bookId]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    };

    //#endregion

    //#region [EXECUTION]

    try {
      const bookIds = await fetchUserBooks(req.session.userId);
      const booksPromises = bookIds.map(fetchBookDetails);
      const books = (await Promise.all(booksPromises)).filter(Boolean);

      res.status(200).json({ books: books });
    } catch (error) {
      console.error('Error fetching user collection:', error);
      res.status(500).json({ error: 'Failed to fetch books from collection.' });
    }

    //#endregion

};  