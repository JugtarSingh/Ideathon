const express = require('express');
const { UserController } = require('../../controller');
const router = express.Router();

router.post('/create-user', UserController.createUser);
router
.get('/login',UserController.loginformRender)
.post('/login', UserController.login);
router
.get('/dashboard', UserController.dashboardRender);

module.exports = router;  