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
router.get('/dashboard', authController.dashboard);

router.post('/auth/signup', authController.signUpUser);
router.post('/auth/signin', authController.signInUser);

module.exports = router;