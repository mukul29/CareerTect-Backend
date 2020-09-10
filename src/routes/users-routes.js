const express = require("express");
const { check } = require("express-validator");
const { signup, login } = require("../controllers/users-controllers");

const router = express.Router();

const validationSettings = {
    passwordMinLength: 6
}

router.post('/login',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: validationSettings.passwordMinLength}),
    ],
    login
);

router.post('/signup',
    [
        check('name').trim().notEmpty(),
        check('email').trim().normalizeEmail().isEmail(),
        check('password').isLength({ min: validationSettings.passwordMinLength }),
        check('type').trim().toInt().isIn([1, 2])
    ],
    signup
);

module.exports = router;