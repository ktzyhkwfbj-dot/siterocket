const express  = require('express');
const path     = require('path');
const multer   = require('multer');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { v2: cloudinary } = require('cloudinary');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Cloudinary ────────────────────────────────────────────────────────────────
// Expects env var: CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
// cloudinary SDK auto-configures itself from CLOUDINARY_URL

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/siterocket')
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });

const siteSchema = new mongoose.Schema({
  slug:         { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  description:  String,
  phone:        String,
  whatsapp:     String,
  images:       [String],
  createdAt:    { type: Date, default: Date.now },
});

const Site = mongoose.model('Site', siteSchema);

// ── Express middleware ────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Multer — memory storage, upload to Cloudinary manually ───────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 3, fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'siterocket' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(name) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${uuidv4().slice(0, 8)}`;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /
app.get('/', (req, res) => {
  res.render('index');
});

// POST /create-site
app.post('/create-site', upload.array('images', 3), async (req, res) => {
  const { businessName, description, phone, whatsapp } = req.body;

  const imageUrls = await Promise.all(
    (req.files || []).map(f => uploadToCloudinary(f.buffer))
  );

  const site = await Site.create({
    slug: slugify(businessName),
    businessName,
    description,
    phone,
    whatsapp,
    images: imageUrls,
  });

  res.redirect(`/site/${site.slug}`);
});

// GET /site/:slug
app.get('/site/:slug', async (req, res) => {
  const site = await Site.findOne({ slug: req.params.slug }).lean();
  if (!site) return res.status(404).send('Site not found');
  res.render('site', { site });
});

// GET /admin
app.get('/admin', async (req, res) => {
  const sites = await Site.find().sort({ createdAt: -1 }).lean();
  res.render('admin', { sites });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message || 'Server error');
});

app.listen(PORT, () => {
  console.log(`siterocket running on http://localhost:${PORT}`);
});
