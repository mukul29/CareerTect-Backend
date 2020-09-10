if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const LOG_TAG = "[check-auth] "

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // we expect token as Bearer <token>
        if (!token) {
            throw new Error("You are not authenticated");
        }

        const { userId, userType, userEmail } = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log({ userId, userType, userEmail });
        res.locals.userId = userId;
        res.locals.userType = userType;
        res.locals.userEmail = userEmail;

        next();
    } catch (err) {
        console.log(LOG_TAG, err);
        return next(new HttpError("You are not authenticated.", 401));
    }
}

module.exports = checkAuth;