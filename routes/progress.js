const express = require('express');
const router = express.Router();

// Function to update progress routes with user data
function updateProgressRoutes(users) {
    // Track quiz results and update progress
    router.post('/track-quiz', (req, res) => {
        try {
            const { quizId, subject, topic, score, totalQuestions, timeTaken, answers } = req.body;
            const userId = req.session.userId;
            
            const user = users.find(u => u.id === userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            
            if (!user.progress.subjects[subject]) {
                user.progress.subjects[subject] = {
                    totalQuizzes: 0,
                    averageScore: 0,
                    topics: {},
                    totalTime: 0
                };
            }
            
            const subjectData = user.progress.subjects[subject];
            subjectData.totalQuizzes++;
            subjectData.averageScore = ((subjectData.averageScore * (subjectData.totalQuizzes - 1)) + score) / subjectData.totalQuizzes;
            subjectData.totalTime += timeTaken;
            
            // Update topic progress
            if (!subjectData.topics[topic]) {
                subjectData.topics[topic] = {
                    quizzes: 0,
                    averageScore: 0,
                    lastAttempt: null
                };
            }
            
            const topicData = subjectData.topics[topic];
            topicData.quizzes++;
            topicData.averageScore = ((topicData.averageScore * (topicData.quizzes - 1)) + score) / topicData.quizzes;
            topicData.lastAttempt = new Date().toISOString();
            
            // Update overall stats
            const overallStats = user.progress.overallStats;
            overallStats.totalQuizzes++;
            overallStats.averageScore = ((overallStats.averageScore * (overallStats.totalQuizzes - 1)) + score) / overallStats.totalQuizzes;
            overallStats.totalTime += timeTaken;
            
            // Add to quiz history
            user.progress.quizHistory.push({
                quizId,
                subject,
                topic,
                score,
                totalQuestions,
                timeTaken,
                date: new Date().toISOString(),
                answers
            });
            
            // Update weekly progress
            const currentWeek = getWeekNumber(new Date());
            const weekEntry = user.progress.weeklyProgress.find(w => w.week === currentWeek);
            
            if (weekEntry) {
                weekEntry.quizzes++;
                weekEntry.totalScore += score;
                weekEntry.averageScore = weekEntry.totalScore / weekEntry.quizzes;
                weekEntry.subjects[subject] = (weekEntry.subjects[subject] || 0) + 1;
            } else {
                user.progress.weeklyProgress.push({
                    week: currentWeek,
                    quizzes: 1,
                    totalScore: score,
                    averageScore: score,
                    subjects: { [subject]: 1 },
                    topics: [topic]
                });
            }
            
            // Analyze weak and strong topics
            analyzeTopics(user);
            
            res.json({ 
                success: true, 
                message: 'Progress tracked successfully',
                updatedStats: user.progress.overallStats
            });
        } catch (error) {
            console.error('Progress Tracking Error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to track progress' 
            });
        }
    });
    
    // Get student progress dashboard
    router.get('/dashboard/:studentId', (req, res) => {
        try {
            const { studentId } = req.params;
            const currentUserId = req.session.userId;
            
            // Ensure user can only access their own data
            if (studentId !== currentUserId) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
            
            const user = users.find(u => u.id === studentId);
            if (!user) {
                return res.json({
                    success: true,
                    dashboard: {
                        studentId,
                        subjects: {},
                        overallStats: {
                            totalQuizzes: 0,
                            averageScore: 0,
                            totalTime: 0,
                            weakTopics: [],
                            strongTopics: []
                        },
                        weeklyProgress: [],
                        recentActivity: [],
                        recommendations: []
                    }
                });
            }
            
            const progress = user.progress;
            const recentActivity = progress.quizHistory.slice(-5).reverse();
            
            // Generate recommendations
            const recommendations = generateRecommendations(progress);
            
            res.json({
                success: true,
                dashboard: {
                    studentId,
                    subjects: progress.subjects,
                    overallStats: progress.overallStats,
                    weeklyProgress: progress.weeklyProgress.slice(-4), // Last 4 weeks
                    recentActivity,
                    recommendations
                }
            });
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to get dashboard' 
            });
        }
    });
    
    // Get subject-wise progress
    router.get('/subject/:studentId/:subject', (req, res) => {
        try {
            const { studentId, subject } = req.params;
            const currentUserId = req.session.userId;
            
            // Ensure user can only access their own data
            if (studentId !== currentUserId) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
            
            const user = users.find(u => u.id === studentId);
            if (!user || !user.progress.subjects[subject]) {
                return res.json({
                    success: true,
                    subjectProgress: {
                        subject,
                        totalQuizzes: 0,
                        averageScore: 0,
                        topics: {},
                        totalTime: 0,
                        improvement: 0
                    }
                });
            }
            
            const subjectData = user.progress.subjects[subject];
            
            res.json({
                success: true,
                subjectProgress: subjectData
            });
        } catch (error) {
            console.error('Subject Progress Error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to get subject progress' 
            });
        }
    });
    
    // Get learning path recommendations
    router.get('/recommendations/:studentId', (req, res) => {
        try {
            const { studentId } = req.params;
            const currentUserId = req.session.userId;
            
            // Ensure user can only access their own data
            if (studentId !== currentUserId) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
            
            const user = users.find(u => u.id === studentId);
            if (!user) {
                return res.json({
                    success: true,
                    recommendations: {
                        weakTopics: [],
                        strongTopics: [],
                        suggestedTopics: [],
                        studyPlan: []
                    }
                });
            }
            
            const progress = user.progress;
            const recommendations = generateDetailedRecommendations(progress);
            
            res.json({
                success: true,
                recommendations
            });
        } catch (error) {
            console.error('Recommendations Error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to get recommendations' 
            });
        }
    });
}

// Helper functions
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function analyzeTopics(user) {
    const progress = user.progress;
    const weakTopics = [];
    const strongTopics = [];
    
    Object.keys(progress.subjects).forEach(subject => {
        const subjectData = progress.subjects[subject];
        Object.keys(subjectData.topics).forEach(topic => {
            const topicData = subjectData.topics[topic];
            if (topicData.averageScore < 60) {
                weakTopics.push({ subject, topic, score: topicData.averageScore });
            } else if (topicData.averageScore > 80) {
                strongTopics.push({ subject, topic, score: topicData.averageScore });
            }
        });
    });
    
    progress.overallStats.weakTopics = weakTopics.slice(0, 5);
    progress.overallStats.strongTopics = strongTopics.slice(0, 5);
}

function generateRecommendations(progress) {
    const recommendations = [];
    
    // Add weak topic recommendations
    progress.overallStats.weakTopics.forEach(({ subject, topic }) => {
        recommendations.push({
            type: 'weak_topic',
            message: `Focus on ${topic} in ${subject}. Your average score is below 60%.`,
            priority: 'high',
            action: 'practice'
        });
    });
    
    // Add study time recommendations
    if (progress.overallStats.totalTime < 300) { // Less than 5 hours
        recommendations.push({
            type: 'study_time',
            message: 'Increase your study time. Aim for at least 1 hour daily.',
            priority: 'medium',
            action: 'schedule'
        });
    }
    
    // Add consistency recommendations
    const recentWeeks = progress.weeklyProgress.slice(-2);
    if (recentWeeks.length === 2 && recentWeeks[1].quizzes < recentWeeks[0].quizzes) {
        recommendations.push({
            type: 'consistency',
            message: 'Maintain consistent study habits. Your activity has decreased.',
            priority: 'medium',
            action: 'motivate'
        });
    }
    
    return recommendations;
}

function generateDetailedRecommendations(progress) {
    const weakTopics = progress.overallStats.weakTopics;
    const strongTopics = progress.overallStats.strongTopics;
    
    // Generate suggested topics based on weak areas
    const suggestedTopics = weakTopics.map(({ subject, topic }) => ({
        subject,
        topic,
        reason: 'Weak performance',
        priority: 'high'
    }));
    
    // Generate study plan
    const studyPlan = [];
    weakTopics.forEach(({ subject, topic }) => {
        studyPlan.push({
            day: studyPlan.length + 1,
            subject,
            topic,
            duration: '45 minutes',
            activities: ['Review concepts', 'Practice problems', 'Take mini-quiz']
        });
    });
    
    return {
        weakTopics,
        strongTopics,
        suggestedTopics,
        studyPlan
    };
}

module.exports = { router, updateProgressRoutes }; 