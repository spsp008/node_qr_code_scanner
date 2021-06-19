const Jimp = require("jimp");
// Importing filesystem module
const fs = require("fs");
// Importing qrcode-reader module
const qrCode = require("qrcode-reader");

const APP_CONSTANTS = require('./constants');

function decodeByFilePath(path) {
  console.log("reading from PATH");
  // Read the image and create a buffer
  // (Here image.png is our QR code)
  const buffer = fs.readFileSync(__dirname + "/station/images/" + path);
  return decode(buffer);
}

function decodeByUrl(url) {
  // TODO: validate url
  console.log("reading from URL");
  return decode(url);
}

function decode(source) {
  return new Promise((resolve, reject) => {
    // Parse the image using Jimp.read() method
    try {
      Jimp.read(source, function (err, image) {
        if (err) {
          console.log(err);
          reject(`${APP_CONSTANTS.ERRORS.IMAGE_PARSING_ERROR}: ${err}`);
        }
        // Creating an instance of qrcode-reader module
        let qrcode = new qrCode();
        qrcode.callback = function (error, value) {
          if (error) {
            console.log(error);
            reject(`${APP_CONSTANTS.ERRORS.QR_CODE_PASSING_ERROR}: ${error}`);
          }
          // Printing the decrypted value
          if (value) {
            console.log(value.result);
            resolve(value.result);
          } else {
            reject(APP_CONSTANTS.ERRORS.SOMETHING_WENT_WRONG);
          }
        };
        // Decoding the QR code
        // console.log(image);
        if (image) {
          qrcode.decode(image.bitmap);
        }
      });
    } catch(err) {
      reject(err);
    }
  })

}

module.exports = {
  decodeByFilePath,
  decodeByUrl
}
