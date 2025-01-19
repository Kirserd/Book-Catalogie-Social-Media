const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/auth'); 
});
router.get('/auth', (req, res) => {
    res.render('signin', { errorMessage: null }); 
});
router.get('/auth/signup', (req, res) => {
    res.render('signup', { errorMessage: null }); 
});

// User Authentication Actions
router.post('/auth/signup', authController.signUpUser);
router.post('/auth/signin', authController.signInUser);

// Protected Routes
router.get('/dashboard', authController.dashboard); 

module.exports = router;