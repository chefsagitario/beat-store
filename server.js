const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'Alpi13789_';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + sanitized);
  }
});
const upload = multer({ storage });

app.get('/api/beats', (req, res) => {
  const beats = JSON.parse(fs.readFileSync('beats.json', 'utf8'));
  res.json(beats);
});

app.post('/api/beats', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  const { password, title, price, genre } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Hatalı şifre' });
  if (!req.files || !req.files['audio'] || !req.files['cover']) {
    return res.status(400).json({ error: 'Audio ve cover dosyası gerekli!' });
  }

  const beats = JSON.parse(fs.readFileSync('beats.json', 'utf8'));
  const newBeat = {
    id: Date.now(),
    title,
    price,
    genre,
    audio: '/uploads/' + req.files['audio'][0].filename,
    cover: '/uploads/' + req.files['cover'][0].filename
  };
  beats.push(newBeat);
  fs.writeFileSync('beats.json', JSON.stringify(beats, null, 2));
  res.json({ success: true });
});

app.delete('/api/beats/:id', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Hatalı şifre' });

  let beats = JSON.parse(fs.readFileSync('beats.json', 'utf8'));
  beats = beats.filter(b => b.id != req.params.id);
  fs.writeFileSync('beats.json', JSON.stringify(beats, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Sunucu çalışıyor: http://localhost:${PORT}`));