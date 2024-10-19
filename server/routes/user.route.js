const express = require('express');
const isAutheticated = require('../middlewares/isAuthenticated');
const { register, login, logout, getProfile, editProfile, getSuggestedUsers, followOrUnfollow } = require('../controllers/user-controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



const router = express.Router()
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAutheticated, getProfile);
router.route('/profile/edit').post(isAutheticated, upload.single('profilePicture'), editProfile);
router.route('/suggested').get(isAutheticated, getSuggestedUsers);
router.route("/followorunfollow/:id").post(isAutheticated, followOrUnfollow)


module.exports = router





