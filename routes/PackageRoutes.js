const express = require('express');
const router = express.Router();

//import controller functionalities
const {createPackage, getAllPackages, deletePackageByPackageId, updatePackageById, getPackageByIdMiddleware} = require('../controllers/PackageController');

//import all the validators
const {create_package_validator, required_login, is_admin} = require('../validators/index');

//restricted route. only admins of the system have authorized to add packages to users
router.post('/package/create', required_login, is_admin, create_package_validator, createPackage);
router.get('/package/all', required_login, is_admin, getAllPackages);
router.delete('/package/:packageId', required_login, is_admin, deletePackageByPackageId);
router.put('/package/:packageId', required_login, is_admin, updatePackageById);

//routes for get params
router.param('packageId', getPackageByIdMiddleware);// Whenever packageId is called, getPackageByIdMiddleware executes

module.exports = router;