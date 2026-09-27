const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session configuration
app.use(session({
    secret: 'eduhub-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Import routes
const { router: authRoutes, users, requireAuth } = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', requireAuth, aiRoutes);
app.use('/api/quiz', requireAuth, quizRoutes);
app.use('/api/progress', requireAuth, progressRoutes);

// Update progress routes to use user-specific data
const { updateProgressRoutes } = require('./routes/progress');
updateProgressRoutes(users);

// Serve main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`EduHub server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the platform`);
}); 