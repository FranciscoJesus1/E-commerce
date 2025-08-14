import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valorant-player';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Schemas
const PlayerDataSchema = new mongoose.Schema({
  name: String,
  gameId: String,
  team: String,
  role: String,
  bio: String,
  city: String,
  kd: String,
  hs: String,
  acs: String,
  adr: String,
  clutchRate: String,
  agents: [{
    name: String,
    role: String
  }],
  achievements: [{
    text: String,
    icon: String
  }]
}, { timestamps: true, strict: false });

const DuoPartnerSchema = new mongoose.Schema({
  name: String,
  gameId: String,
  role: String,
  rank: String
}, { timestamps: true, strict: false });

const TeamMemberSchema = new mongoose.Schema({
  id: String,
  name: String,
  gameId: String,
  role: String,
  rank: String,
  photo: String,
  socialLinks: {
    twitch: String,
    discord: String,
    twitter: String,
    instagram: String
  }
}, { timestamps: true, strict: false });

const GalleryImageSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String
}, { timestamps: true });

const HighlightVideoSchema = new mongoose.Schema({
  title: String,
  url: String
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  date: String,
  vs: String,
  event: String,
  map: String,
  result: String
}, { timestamps: true });

const BackgroundMusicSchema = new mongoose.Schema({
  url: String,
  volume: Number
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({
  isDarkMode: Boolean
}, { timestamps: true });

const WebhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  backupData: {
    url: String,
    timestamp: Number,
    created: String
  },
  recoveryCode: String,
  configExport: String
}, { timestamps: true });

// Models
const PlayerData = mongoose.model('PlayerData', PlayerDataSchema);
const DuoPartner = mongoose.model('DuoPartner', DuoPartnerSchema);
const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);
const GalleryImage = mongoose.model('GalleryImage', GalleryImageSchema);
const HighlightVideo = mongoose.model('HighlightVideo', HighlightVideoSchema);
const Event = mongoose.model('Event', EventSchema);
const BackgroundMusic = mongoose.model('BackgroundMusic', BackgroundMusicSchema);
const Settings = mongoose.model('Settings', SettingsSchema);
const Webhook = mongoose.model('Webhook', WebhookSchema);

// Routes

// Player Data
app.get('/api/player-data', async (req, res) => {
  try {
    const playerData = await PlayerData.findOne().sort({ createdAt: -1 });
    res.json(playerData || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/player-data', async (req, res) => {
  try {
    await PlayerData.deleteMany({});
    const playerData = new PlayerData(req.body);
    await playerData.save();
    res.json(playerData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duo Partner
app.get('/api/duo-partner', async (req, res) => {
  try {
    const duoPartner = await DuoPartner.findOne().sort({ createdAt: -1 });
    res.json(duoPartner || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/duo-partner', async (req, res) => {
  try {
    await DuoPartner.deleteMany({});
    const duoPartner = new DuoPartner(req.body);
    await duoPartner.save();
    res.json(duoPartner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Team Members
app.get('/api/team-members', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ createdAt: -1 });
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/team-members', async (req, res) => {
  try {
    await TeamMember.deleteMany({});
    const teamMembers = await TeamMember.insertMany(req.body);
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gallery Images
app.get('/api/gallery-images', async (req, res) => {
  try {
    const galleryImages = await GalleryImage.find().sort({ createdAt: -1 });
    res.json(galleryImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gallery-images', async (req, res) => {
  try {
    await GalleryImage.deleteMany({});
    const galleryImages = await GalleryImage.insertMany(req.body);
    res.json(galleryImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Highlight Videos
app.get('/api/highlight-videos', async (req, res) => {
  try {
    const highlightVideos = await HighlightVideo.find().sort({ createdAt: -1 });
    res.json(highlightVideos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/highlight-videos', async (req, res) => {
  try {
    await HighlightVideo.deleteMany({});
    const highlightVideos = await HighlightVideo.insertMany(req.body);
    res.json(highlightVideos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    await Event.deleteMany({});
    const events = await Event.insertMany(req.body);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Background Music
app.get('/api/background-music', async (req, res) => {
  try {
    const backgroundMusic = await BackgroundMusic.findOne().sort({ createdAt: -1 });
    res.json(backgroundMusic || { url: '', volume: 0.5 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/background-music', async (req, res) => {
  try {
    await BackgroundMusic.deleteMany({});
    const backgroundMusic = new BackgroundMusic(req.body);
    await backgroundMusic.save();
    res.json(backgroundMusic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne().sort({ createdAt: -1 });
    res.json(settings || { isDarkMode: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = new Settings(req.body);
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook
app.get('/api/webhook', async (req, res) => {
  try {
    const webhook = await Webhook.findOne({ isActive: true }).sort({ createdAt: -1 });
    res.json(webhook || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/webhook', async (req, res) => {
  try {
    // Desactivar webhooks anteriores
    await Webhook.updateMany({}, { isActive: false });
    
    const webhook = new Webhook({
      ...req.body,
      isActive: true
    });
    await webhook.save();
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/webhook/:id', async (req, res) => {
  try {
    const webhook = await Webhook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/webhook', async (req, res) => {
  try {
    await Webhook.deleteMany({});
    res.json({ message: 'Todos los webhooks eliminados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
