const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const { nanoid } = require("nanoid");
const SHORT_ID_LENGTH = 10;
const PORT = 4000;
const APP_CONSTANTS = require('./constants');

const { decodeByUrl, decodeByFilePath } = require('./imageScanner');

const storage = multer.diskStorage({
  destination: "./station/images",
  filename: (req, file, callBack) => {
    return callBack(
      null,
      `${file.fieldname}_${nanoid(SHORT_ID_LENGTH)}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: APP_CONSTANTS.FILE_SIZE
  },
});

app.use("/images", express.static("station/images"));
app.post("/decode", upload.single("media"), async (req, res) => {
  try {
    let url = null;

    if (req.body.media_url && req.body.media_url.trim()) {
      url = req.body.media_url.trim();
    } else if (req.file) {
      url = `http://localhost:${PORT}/images/${req.file.filename}`;
    }

    if (!url) {
      res.status(422).json({
        success: false,
        message: 'Url or Image is required'
      });
    }

    const text = await decodeByUrl(url);
    res.json({
      text,
      message: 'Image decoded successfully!',
      success: true,
      image_url: url,
    });
  } catch(err) {
    const message = err && err.message ? err.message : APP_CONSTANTS.ERRORS.SOMETHING_WENT_WRONG;
    res.json({
      success: false,
      message
    })
  }
});

function errHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.json({
      success: false,
      message: err.message,
    });
  }
}

app.use(errHandler);

app.listen(PORT, () => {
  console.log(`server up and running on port: ${PORT}`);
});
