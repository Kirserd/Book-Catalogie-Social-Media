const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const session = require('express-session');

const bookRoutes = require('./routes/bookRoutes');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');

dotenv.config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', "./views/");

app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use((req, res, next) => {
  const fileExtension = req.url.split('.').pop();
  const excludedExtensions = ['css', 'js', 'jpg', 'png', 'ico'];
  const excludedURLs = ['/friends/getFriendList', '/friends/getFriendRequests'];

  if (excludedExtensions.includes(fileExtension) || excludedURLs.includes(req.url)) {
    return next();
  }

  const logFilePath = './logs/usage.log';
  const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("Failed to write log:", err);
  });

  console.log(logMessage);
  next();
});

app.use(express.json());
app.use('/', bookRoutes);
app.use('/', authRoutes);
app.use('/friends/', friendRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const pool = require('./models/db');

pool.connect((err, client, release) => {
    if (err) {
      console.error('Database Connection: FALSE\nREASON: ', err);
    } else {
      console.log('Database Connection: TRUE');
    }
});

