const express = require('express');
const router = express.Router();
const resorts = require('../controllers/resorts');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateResort} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Resort = require('../models/resort');

router.route('/')
    .get(catchAsync(resorts.index))
    .post(isLoggedIn, upload.array('image'), validateResort, catchAsync(resorts.createResort))


router.get('/new', isLoggedIn, resorts.renderNewForm)

router.route('/:id')
    .get(catchAsync(resorts.showResort))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateResort, catchAsync(resorts.updateResort))
    .delete(isLoggedIn, isAuthor, catchAsync(resorts.deleteResort));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(resorts.renderEditForm))

module.exports = router;