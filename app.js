const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const { nanoid } = require("nanoid");
const PORT = 4000;
const APP_CONSTANTS = require("./constants");

const { decodeByUrl, decodeByFilePath } = require("./imageScanner");

app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: "./station/images",
  filename: (req, file, callBack) => {
    return callBack(
      null,
      `${file.fieldname}_${nanoid(APP_CONSTANTS.SHORT_ID_LENGTH)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: APP_CONSTANTS.FILE_SIZE,
  },
  fileFilter: function (req, file, callBack) {
    // Set the filetypes, it is optional
    var filetypes = /jpeg|jpg|png/;
    var mimetype = filetypes.test(file.mimetype);

    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return callBack(null, true);
    }

    callBack(
      "Error: File upload only supports the " +
        "following filetypes - " +
        filetypes
    );
  },
}).single("media");

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/test", (req, res) => {
  res.send("QR scanner Working!!!");
});

app.use("/images", express.static("station/images"));

app.post("/decode", async (req, res) => {
  upload(req,res, async (err) => {
    if(err) {
      // ERROR occured due to set filters not passed
      return res.status(422).json({
        success: false,
        message: err,
      });
    } else {
        let source = null;
        let isUrl = false;
        let url = null;
      try {
        if (isValidUrl(req.body.media_url)) {
          source = req.body.media_url.trim();
          url = source;
          isUrl = true;
        } else if (req.file) {
          url = `${req.protocol}://${req.headers.host}/images/${req.file.filename}`;
          source = req.file.filename;
        }

        if (!source) {
          return res.status(422).json({
            success: false,
            message: "Valid Url or Image is required",
          });
        }

        let text = null;
        if (isUrl) {
          text = await decodeByUrl(source);
        } else {
          text = await decodeByFilePath(source);
        }

        return res.json({
          success: true,
          text,
          message: "Image decoded successfully!",
        });
      } catch (err) {
        const message = err.message
          ? err.message
          : err
          ? err
          : APP_CONSTANTS.ERRORS.SOMETHING_WENT_WRONG;
        return res.json({
          success: false,
          message,
        });
      } finally {
        if (!isUrl && source) {
          const path = __dirname + "/station/images/" + source;
          const fs = require("fs");
          setTimeout(() => {
            fs.unlinkSync(path);
          }, 100);
        }
      }
    }
  });
});

function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: false,
      message: err.message,
    });
  }
}

function isValidUrl(url) {
  if (!url) return false;
  var expression =
    /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  return url.match(regex);
}

app.use(errHandler);

app.listen(PORT, () => {
  console.log(`server up and running on port: ${PORT}`);
});
