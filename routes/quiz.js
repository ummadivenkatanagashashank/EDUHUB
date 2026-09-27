const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate AI-powered mock tests
router.post('/generate-test', async (req, res) => {
    try {
        const { subject, topic, difficulty, examType, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate a comprehensive mock test for ${subject} - Topic: ${topic} with ${difficulty} difficulty level for ${examType} exam in ${language}.

        Create 10 multiple choice questions with the following format:
        
        Question 1: [Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Brief explanation of why this is correct]
        
        Make sure:
        1. Questions are relevant to the topic and exam level
        2. All options are plausible
        3. Include detailed explanations
        4. Cover different aspects of the topic
        5. Follow the exact format specified`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response to extract questions
        const questions = parseQuizQuestions(text);
        
        res.json({ 
            success: true, 
            quiz: {
                subject: subject,
                topic: topic,
                difficulty: difficulty,
                examType: examType,
                language: language,
                questions: questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Quiz Generation Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate quiz' 
        });
    }
});

// Generate personalized quiz based on progress
router.post('/personalized-quiz', async (req, res) => {
    try {
        const { subjects, weakTopics, strongTopics, examType, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate a personalized quiz based on the student's learning profile:
        
        Subjects: ${subjects.join(', ')}
        Weak Topics (focus more on these): ${weakTopics.join(', ')}
        Strong Topics (fewer questions): ${strongTopics.join(', ')}
        Exam Type: ${examType}
        Language: ${language}
        
        Create 15 questions with the following distribution:
        - 60% from weak topics (9 questions)
        - 40% from strong topics (6 questions)
        
        Format each question as:
        Question X: [Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Detailed explanation]
        Topic: [Topic name]
        Difficulty: [Easy/Medium/Hard]`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const questions = parseQuizQuestions(text);
        
        res.json({ 
            success: true, 
            quiz: {
                type: 'personalized',
                subjects: subjects,
                weakTopics: weakTopics,
                strongTopics: strongTopics,
                examType: examType,
                language: language,
                questions: questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Personalized Quiz Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate personalized quiz' 
        });
    }
});

// Weekly progress quiz
router.post('/weekly-quiz', async (req, res) => {
    try {
        const { weeklyTopics, examType, language = 'English' } = req.body;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Generate a weekly progress quiz covering the following topics studied this week:
        
        Topics: ${weeklyTopics.join(', ')}
        Exam Type: ${examType}
        Language: ${language}
        
        Create 20 questions (2-3 questions per topic) to test understanding:
        
        Format:
        Question X: [Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        D) [Option D]
        Correct Answer: [Letter]
        Explanation: [Explanation]
        Topic: [Topic name]
        Week: [Week number]`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const questions = parseQuizQuestions(text);
        
        res.json({ 
            success: true, 
            quiz: {
                type: 'weekly-progress',
                topics: weeklyTopics,
                examType: examType,
                language: language,
                questions: questions,
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Weekly Quiz Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate weekly quiz' 
        });
    }
});

// Helper function to parse quiz questions from AI response
function parseQuizQuestions(text) {
    const questions = [];
    const questionBlocks = text.split(/Question \d+:/).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').filter(line => line.trim());
        const question = {
            id: index + 1,
            question: '',
            options: {},
            correctAnswer: '',
            explanation: '',
            topic: '',
            difficulty: 'Medium'
        };
        
        let currentSection = 'question';
        
        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('A)')) {
                question.options.A = line.substring(2).trim();
            } else if (line.startsWith('B)')) {
                question.options.B = line.substring(2).trim();
            } else if (line.startsWith('C)')) {
                question.options.C = line.substring(2).trim();
            } else if (line.startsWith('D)')) {
                question.options.D = line.substring(2).trim();
            } else if (line.startsWith('Correct Answer:')) {
                question.correctAnswer = line.split(':')[1].trim();
            } else if (line.startsWith('Explanation:')) {
                question.explanation = line.split(':')[1].trim();
            } else if (line.startsWith('Topic:')) {
                question.topic = line.split(':')[1].trim();
            } else if (line.startsWith('Difficulty:')) {
                question.difficulty = line.split(':')[1].trim();
            } else if (question.question === '') {
                question.question = line;
            }
        });
        
        if (question.question && Object.keys(question.options).length >= 4) {
            questions.push(question);
        }
    });
    
    return questions;
}

module.exports = router; 