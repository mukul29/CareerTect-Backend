const multer = require("multer");
const {v1: uuidv1} = require("uuid");

// set file size limit to 200 KB
const SIZE_LIMIT_IN_BYTES = 200000;
const MIME_TYPES_MAP = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
};

const fileUpload = multer({
    // upload size limit
    limits: SIZE_LIMIT_IN_BYTES,
    storage: multer.diskStorage({
        // set the destination folder
        // TODO: check if the upload destination does not exist
        // make the directories required if it doesn't
        // Optionally add another layer of folders unique to each user
        destination: (req, file, callback) => {
            callback(null, 'uploads/images')
        },
        // get the extension from the mimetype and save the file with a unique filename
        filename: (req, file, callback) => {
            const ext = MIME_TYPES_MAP[file.mimetype]
            callback(null, uuidv1() + '.' + ext)
        },
    }),
    fileFilter: (req, file, callback) => {
        // check if the file is valid
        const isValid = !!MIME_TYPES_MAP[file.mimetype];
        let error = isValid ? null : new Error("Invalid mime type");
        callback(error, isValid);
    }
});

module.exports = fileUpload;