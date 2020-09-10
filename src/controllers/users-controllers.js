if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { withTransaction } = require("../utils/db-helper/db-helper");
const { createUserDB, getUserByEmailDB, createSeekerDB, createRecruiterDB } = require("../utils/db-helper/users");
const HttpError = require("../models/http-error");
const { SEEKER, RECRUITER } = require('../values/user-types');

const LOG_TAG = "[users-controllers] ";
const JWT_OPTIONS = { expiresIn: '1h' };
const BCRYPT_ROUNDS = 12;

// TODO: also return the expiration time and refresh token in response

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }
    const { email, password } = req.body;

    // check if the user already exists
    let existingUserResult;
    try {
        existingUserResult = await getUserByEmailDB(email, config = { password: true, type: true });
    } catch (err) {
        return next(new HttpError("Something went wrong. Could not login.", 500));
    }

    // handle existing user
    if (existingUserResult.rowCount < 1) {
        return next(new HttpError("Could not login. Email does not exist.", 422));
    }

    const userId = existingUserResult.rows[0].user_id;
    const hashedPassword = existingUserResult.rows[0].password;
    const type = existingUserResult.rows[0].type;
    let token;
    try {
        const isSamePassword = await bcrypt.compare(password, hashedPassword);
        if (!isSamePassword) {
            return next(new HttpError("Incorrect credentials, please try again."), 422);
        }
        token = jwt.sign({ userId: userId, userEmail: email, userType: type }, process.env.JWT_SECRET_KEY, JWT_OPTIONS);
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("Something went wrong, please try again.", 500));
    }

    res.status(200).json({ token: token, type: type });

}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check your data.", 422));
    }

    const { email, name, password, type } = req.body;

    // check if the user already exists
    let existingUserResult;
    try {
        existingUserResult = await getUserByEmailDB(email);
    } catch (err) {
        return next(new HttpError("Something went wrong. Could not sign up.", 500));
    }

    // handle existing user
    if (existingUserResult.rowCount == 1) {
        return next(new HttpError("Could not sign up. User with Email already exists.", 422));
    }

    // generate jwt token
    let token;
    try {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        
        const id = await withTransaction(async (_, transaction) => {
            const userId = await createUserDB({ fullName: name, email: email, password: hashedPassword, type: type }, transaction);
            if(type === SEEKER) {
                await createSeekerDB({ seekerId: userId }, transaction);
            } else if(type === RECRUITER) {
                await createRecruiterDB({recruiterId: userId}, transaction);
            }
            return userId;
        })(null);

        token = jwt.sign({ userId: id, userEmail: email, userType: type }, process.env.JWT_SECRET_KEY, JWT_OPTIONS)
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("Something went wrong, could not create user.", 500));
    }
    res.status(201).json({ token: token, type: type });
}

exports.signup = signup;
exports.login = login;