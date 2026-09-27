const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory user storage (in production, use a database)
let users = [];

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ success: false, error: 'Authentication required' });
    }
}

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, grade, examType } = req.body;
        
        // Validate input
        if (!name || !email || !password || !grade || !examType) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        
        // Check if user already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            grade,
            examType,
            createdAt: new Date().toISOString(),
            progress: {
                subjects: {},
                overallStats: {
                    totalQuizzes: 0,
                    averageScore: 0,
                    totalTime: 0,
                    weakTopics: [],
                    strongTopics: []
                },
                weeklyProgress: [],
                quizHistory: []
            }
        };
        
        users.push(newUser);
        
        // Create session
        req.session.userId = newUser.id;
        req.session.userName = newUser.name;
        
        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                grade: newUser.grade,
                examType: newUser.examType
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        
        // Create session
        req.session.userId = user.id;
        req.session.userName = user.name;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                grade: user.grade,
                examType: user.examType
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed'
        });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check authentication status
router.get('/status', (req, res) => {
    if (req.session.userId) {
        const user = users.find(u => u.id === req.session.userId);
        if (user) {
            res.json({
                success: true,
                authenticated: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    grade: user.grade,
                    examType: user.examType
                }
            });
        } else {
            res.json({
                success: true,
                authenticated: false
            });
        }
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Get current user
router.get('/me', requireAuth, (req, res) => {
    const user = users.find(u => u.id === req.session.userId);
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                grade: user.grade,
                examType: user.examType
            }
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
});

// Export users array for use in other routes
module.exports = { router, users, requireAuth }; 