const express = require('express');
const router = express.Router();

//import controller functionalities
const {
    createUser, login, createAdminUser, getUserById,
    updateUserById, checkOutstanding, checkOutstandingMiddleware,
    getUsersWithNoPackage, updateUserPackageByUserId, getUserByIdMiddleware
} = require('../controllers/UserController');

//import all the validators
const {create_user_validator, login_validator, required_login, is_admin, is_auth} = require('../validators/index');

//non restricted routes
router.post('/user/create', create_user_validator, createUser);
router.post('/user/login', login_validator, login);

//routes that only the owner and system admins can get
router.get('/user/:userId', required_login, is_auth, getUserById);
router.put('/user/:userId', required_login, is_auth, checkOutstandingMiddleware, updateUserById);
router.get('/checkOutstanding/:userId', required_login, is_auth, checkOutstanding);

//restricted routes that only a system admin can access
router.post('/user/admin/create', required_login, is_admin, create_user_validator, createAdminUser);
router.get('/user/without/package', required_login, is_admin, getUsersWithNoPackage);
router.put('/user/add/package/:userId', required_login, is_admin, updateUserPackageByUserId);

//will be called for each url that has userId keyword
router.param("userId", getUserByIdMiddleware)

module.exports = router;