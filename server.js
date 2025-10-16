import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import routes
import routes from './routes/index.js';
import setupPasswordRoutes from './routes/passwordReset.js';
import adminRoutes from './routes/adminRoutes.js';
import fileUploadRouter from './utils/fileUpload.js';
import deanRoutes from "./routes/deanPages/index.js";

console.log('🔧 Environment check:');
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
console.log('PORT:', process.env.PORT);
console.log('SESSION_SECRET exists:', !!process.env.SESSION_SECRET);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // ✅ Define app BEFORE using it

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files for uploaded images
app.use('/TestImages', express.static('public/TestImages'));

// Mount the upload API
app.use('/', fileUploadRouter);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'p3finals-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only for HTTPS
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

// Custom middleware for session debug
app.use((req, res, next) => {
  console.log('🔄 Session middleware - User:', req.session.user);
  res.locals.user = req.session.user || null;
  next();
});

// ✅ Register routes
app.use('/', routes);
app.use('/', setupPasswordRoutes);
app.use('/', adminRoutes);
app.use("/dean", deanRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
