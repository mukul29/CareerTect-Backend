if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const HttpError = require("./models/http-error");
const userRoutes = require("./routes/users-routes.js");
const jobRoutes = require("./routes/jobs-routes.js");


// initialize express app
const app = express();

// Constants
const PORT = process.env.PORT || 5000;
const LOG_TAG = "[app.js] ";

// Enable all cors requests
// see https://github.com/expressjs/cors
app.use(cors());

// parse the request body
// this step isn't required for this application since multer is used for parsing 'multipart/form-data'
// still there may be more requests in the future taking 'application/json'
app.use(bodyParser.json());

// making uploaded images statically available
app.use("/uploads/images", express.static(path.join('uploads', 'images')));

// ADD ROUTES HERE
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);


///////////////////////////


// For any other endpoint which isn't set, throw 404
app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    return next(error);
});

// we reach this middleware when an error occurs
app.use((error, req, res, next) => {
    // Delete any file which may have been added (for rolling back)
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            // TODO: Optionally add a log for undeleted files for manual deletion of files
            console.log(err);
        });
    }

    // following check prevents sending multiple responses 
    if (res.headerSent) {
        return next(error);
    }

    // set error code and finally return the response
    res.status(error.code || 500);
    res.json({ message: error.message || "Something went wrong." });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});