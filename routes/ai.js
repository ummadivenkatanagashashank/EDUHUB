const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// AI Tutor for instant doubt solving
router.post('/tutor', async (req, res) => {
    try {
        const { question, subject, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `You are an expert ${subject} tutor. Answer the following question in ${language}:
        
        Question: ${question}
        
        Provide a clear, step-by-step explanation that a student can easily understand. Include relevant examples if applicable.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ 
            success: true, 
            answer: text,
            subject: subject,
            language: language
        });
    } catch (error) {
        console.error('AI Tutor Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get AI tutor response' 
        });
    }
});

// Subject explanations
router.post('/explain', async (req, res) => {
    try {
        const { topic, subject, level, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Explain the topic "${topic}" from ${subject} for ${level} level students in ${language}.
        
        Include:
        1. Clear definition and concepts
        2. Key points and formulas
        3. Real-world examples
        4. Common misconceptions
        5. Practice questions
        
        Make it engaging and easy to understand.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ 
            success: true, 
            explanation: text,
            topic: topic,
            subject: subject,
            level: level,
            language: language
        });
    } catch (error) {
        console.error('Explanation Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate explanation' 
        });
    }
});

// Generate study materials
router.post('/study-materials', async (req, res) => {
    try {
        const { subject, chapter, examType, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Create comprehensive study materials for ${subject} - Chapter: ${chapter} for ${examType} exam in ${language}.
        
        Include:
        1. Chapter summary
        2. Important concepts
        3. Key formulas and definitions
        4. Solved examples
        5. Practice problems
        6. Quick revision points
        7. Common mistakes to avoid
        
        Format it in a structured way that's easy to study.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ 
            success: true, 
            materials: text,
            subject: subject,
            chapter: chapter,
            examType: examType,
            language: language
        });
    } catch (error) {
        console.error('Study Materials Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate study materials' 
        });
    }
});

// Language translation
router.post('/translate', async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Translate the following educational content to ${targetLanguage}. Maintain the educational context and accuracy:
        
        ${text}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();
        
        res.json({ 
            success: true, 
            original: text,
            translated: translatedText,
            targetLanguage: targetLanguage
        });
    } catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to translate content' 
        });
    }
});

module.exports = router; 