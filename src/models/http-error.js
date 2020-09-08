// Datamodel for HttpErrors
class HttpError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.code = errorCode;
    }
}

// import and use this in a middleware with
// throw new HttpError(<message>, <code>)
// or 
// return next(new HttpError(<message>, <code>))

module.exports = HttpError;