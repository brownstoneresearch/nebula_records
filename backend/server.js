import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
fs.mkdirSync(path.join(process.cwd(), UPLOAD_DIR), { recursive: true });
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ tracks: [], artists: [], events: [] }, null, 2));
const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, UPLOAD_DIR), filename: (req, file, cb) => cb(null, `${Date.now()}-${uuid()}-${file.originalname.replace(/\s+/g, '-')}`) });
const upload = multer({ storage, limits: { fileSize: 60 * 1024 * 1024 } });
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), UPLOAD_DIR)));
function readDB(){ return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(db){ fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function auth(req, res, next){ const token = req.headers.authorization?.replace('Bearer ', ''); if (!process.env.ADMIN_PASSWORD || token === process.env.ADMIN_PASSWORD) return next(); return res.status(401).json({ error: 'Unauthorized' }); }
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Nebula Records API' }));
app.post('/api/login', (req, res) => { if (req.body.password === process.env.ADMIN_PASSWORD) return res.json({ token: process.env.ADMIN_PASSWORD }); res.status(401).json({ error: 'Invalid password' }); });
app.get('/api/tracks', (req, res) => res.json(readDB().tracks));
app.post('/api/tracks', auth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => { const db = readDB(); const track = { id: uuid(), title: req.body.title, artist: req.body.artist || 'Blocboykiddie', type: req.body.type || 'Single', link: req.body.link || 'https://songwhip.com/blocboykiddie', audio: req.files?.audio?.[0]?.path, cover: req.files?.cover?.[0]?.path, createdAt: new Date().toISOString() }; db.tracks.unshift(track); writeDB(db); res.json(track); });
app.get('/api/artists', (req, res) => res.json(readDB().artists));
app.post('/api/artists', auth, (req, res) => { const db = readDB(); const artist = { id: uuid(), name: req.body.name, genre: req.body.genre || 'Open', status: req.body.status || 'pipeline', createdAt: new Date().toISOString() }; db.artists.push(artist); writeDB(db); res.json(artist); });
app.post('/api/analytics/event', (req, res) => { const db = readDB(); const event = { id: uuid(), ...req.body, createdAt: new Date().toISOString() }; db.events.push(event); writeDB(db); res.json({ ok: true }); });
app.get('/api/analytics/summary', auth, (req, res) => { const db = readDB(); res.json({ tracks: db.tracks.length, artists: db.artists.length, events: db.events.length, recent: db.events.slice(-50) }); });
app.listen(PORT, () => console.log(`Nebula Records API running on :${PORT}`));
