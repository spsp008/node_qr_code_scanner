const APP_CONSTANTS = {
    SHORT_ID_LENGTH: 10,
    FILE_SIZE: 1000000,
    ERRORS: Object.freeze({
        IMAGE_PARSING_ERROR: 'Unable to read image',
        QR_CODE_PASSING_ERROR: 'Unable to decode image',
        SOMETHING_WENT_WRONG: 'Something went wrong'
    })
}

module.exports = Object.freeze(APP_CONSTANTS);
