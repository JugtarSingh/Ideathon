const express = require('express');
const { HomeController } = require('../controller');
const { attachUserFromToken } = require('../middleware/auth-middleware');
const router = express.Router();

router.use(attachUserFromToken);

router.get('/', HomeController.getHomePage);
router.get('/bestsellers', HomeController.getBestsellers);
router.get('/categories', HomeController.getCategories);
router.get('/cart', HomeController.getCart);
// Product detail route - handled by API routes

module.exports = router;

