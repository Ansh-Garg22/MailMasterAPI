const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.post('/upload/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const filePath = req.file.path;

  if (!req.file) {
    return res.status(400).send('Please upload a file');
  }

  userController.processCSVFile(filePath, id, res)
    .catch(err => res.status(500).send('Error adding users'));
});

module.exports = router;
