// Global variables
let currentUser = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizAnswers = {};
let quizStartTime = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.authenticated) {
            currentUser = data.user;
            showApp();
        } else {
            showAuth();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAuth();
    }
}

function showAuth() {
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('app-section').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    
    // Update user name in navigation
    if (currentUser) {
        document.getElementById('user-name').textContent = `Welcome, ${currentUser.name}`;
    }
    
    // Initialize app functionality
    initializeApp();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const loginBtn = event.target.querySelector('.auth-btn');
    const loadingSpan = document.getElementById('login-loading');
    const textSpan = document.getElementById('login-text');
    
    // Show loading
    loginBtn.disabled = true;
    loadingSpan.style.display = 'inline-block';
    textSpan.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showApp();
            showMessage('Login successful!', 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    } finally {
        // Hide loading
        loginBtn.disabled = false;
        loadingSpan.style.display = 'none';
        textSpan.style.display = 'inline';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const grade = document.getElementById('register-grade').value;
    const examType = document.getElementById('register-exam').value;
    
    const registerBtn = event.target.querySelector('.auth-btn');
    const loadingSpan = document.getElementById('register-loading');
    const textSpan = document.getElementById('register-text');
    
    // Show loading
    registerBtn.disabled = true;
    loadingSpan.style.display = 'inline-block';
    textSpan.style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, grade, examType })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            showApp();
            showMessage('Registration successful!', 'success');
        } else {
            showMessage(data.error, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Registration failed. Please try again.', 'error');
    } finally {
        // Hide loading
        registerBtn.disabled = false;
        loadingSpan.style.display = 'none';
        textSpan.style.display = 'inline';
    }
}

async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            showAuth();
            showMessage('Logged out successfully', 'success');
        } else {
            showMessage('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Logout failed', 'error');
    }
}

function showLoginForm() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('register-form').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('register-form').classList.add('active');
    document.getElementById('login-form').classList.remove('active');
}

// Initialize the application
function initializeApp() {
    setupNavigation();
    loadDashboard();
    setupEventListeners();
    updateLanguageSelector();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Dashboard functionality
async function loadDashboard() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/progress/dashboard/${currentUser.id}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            updateDashboardStats(data.dashboard);
            updateRecentActivity(data.dashboard.recentActivity);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateDashboardStats(dashboard) {
    const stats = dashboard.overallStats;
    
    document.getElementById('total-subjects').textContent = Object.keys(dashboard.subjects).length;
    document.getElementById('total-quizzes').textContent = stats.totalQuizzes;
    document.getElementById('avg-score').textContent = Math.round(stats.averageScore) + '%';
    document.getElementById('study-time').textContent = Math.round(stats.totalTime / 60) + 'h';
    
    // Update progress section stats
    document.getElementById('overall-avg').textContent = Math.round(stats.averageScore) + '%';
    document.getElementById('overall-quizzes').textContent = stats.totalQuizzes;
    document.getElementById('overall-time').textContent = Math.round(stats.totalTime / 60) + 'h';
    
    // Update weak and strong topics
    updateTopicsList('weak-topics', stats.weakTopics);
    updateTopicsList('strong-topics', stats.strongTopics);
    
    // Update recommendations
    updateRecommendations(dashboard.recommendations);
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="text-align: center; color: #666;">No recent activity</p>';
        return;
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = getActivityIcon(activity.subject);
        const date = new Date(activity.date).toLocaleDateString();
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.subject} Quiz</h4>
                <p>Score: ${activity.score}% • ${date}</p>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

function getActivityIcon(subject) {
    const icons = {
        'Mathematics': 'fas fa-square-root-alt',
        'Physics': 'fas fa-atom',
        'Chemistry': 'fas fa-flask',
        'Biology': 'fas fa-dna',
        'default': 'fas fa-book'
    };
    return icons[subject] || icons.default;
}

function updateTopicsList(containerId, topics) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (topics.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No topics available</p>';
        return;
    }
    
    topics.forEach(topic => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        topicItem.innerHTML = `
            <span class="topic-name">${topic.topic}</span>
            <span class="topic-score">${Math.round(topic.score)}%</span>
        `;
        container.appendChild(topicItem);
    });
}

function updateRecommendations(recommendations) {
    const container = document.getElementById('recommendations-list');
    container.innerHTML = '';
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No recommendations available</p>';
        return;
    }
    
    recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = 'recommendation-item';
        
        const icon = getRecommendationIcon(rec.type);
        
        recItem.innerHTML = `
            <div class="recommendation-icon">
                <i class="${icon}"></i>
            </div>
            <div class="recommendation-content">
                <h4>${rec.type.replace('_', ' ').toUpperCase()}</h4>
                <p>${rec.message}</p>
            </div>
        `;
        
        container.appendChild(recItem);
    });
}

function getRecommendationIcon(type) {
    const icons = {
        'weak_topic': 'fas fa-exclamation-triangle',
        'study_time': 'fas fa-clock',
        'consistency': 'fas fa-chart-line',
        'default': 'fas fa-lightbulb'
    };
    return icons[type] || icons.default;
}

// AI Tutor functionality
function openAITutor() {
    document.querySelector('a[href="#ai-tutor"]').click();
}

async function sendQuestion() {
    if (!currentUser) return;
    
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    const subject = document.getElementById('tutor-subject').value;
    const language = document.getElementById('language-selector').value;
    
    if (!question) {
        showMessage('Please enter a question', 'error');
        return;
    }
    
    // Add user message to chat
    addMessageToChat(question, 'user');
    questionInput.value = '';
    
    try {
        const response = await fetch('/api/ai/tutor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                question: question,
                subject: subject,
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            addMessageToChat(data.answer, 'ai');
        } else {
            addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
        }
    } catch (error) {
        console.error('Error sending question:', error);
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

function askQuickQuestion(question) {
    document.getElementById('question-input').value = question;
    sendQuestion();
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="${avatar}"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quiz functionality
function generateQuiz() {
    document.querySelector('a[href="#quizzes"]').click();
}

async function generateMockTest() {
    if (!currentUser) return;
    
    const subject = document.getElementById('mock-subject').value;
    const topic = document.getElementById('mock-topic').value;
    const difficulty = document.getElementById('mock-difficulty').value;
    const language = document.getElementById('language-selector').value;
    
    if (!subject || !topic) {
        showMessage('Please select both subject and topic', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/quiz/generate-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                subject: subject,
                topic: topic,
                difficulty: difficulty,
                examType: 'Mock Test',
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            startQuiz(data.quiz);
        } else {
            showMessage('Failed to generate quiz', 'error');
        }
    } catch (error) {
        console.error('Error generating quiz:', error);
        showMessage('Failed to generate quiz', 'error');
    }
}

async function generatePersonalizedQuiz() {
    if (!currentUser) return;
    
    try {
        // Get student's weak and strong topics from progress
        const response = await fetch(`/api/progress/recommendations/${currentUser.id}`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const recommendations = data.recommendations;
            const weakTopics = recommendations.weakTopics.map(t => t.topic);
            const strongTopics = recommendations.strongTopics.map(t => t.topic);
            const subjects = [...new Set([...weakTopics, ...strongTopics].map(t => t.split(' - ')[0]))];
            
            const quizResponse = await fetch('/api/quiz/personalized-quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    subjects: subjects,
                    weakTopics: weakTopics,
                    strongTopics: strongTopics,
                    examType: 'Personalized',
                    language: document.getElementById('language-selector').value
                })
            });
            
            const quizData = await quizResponse.json();
            
            if (quizData.success) {
                startQuiz(quizData.quiz);
            } else {
                showMessage('Failed to generate personalized quiz', 'error');
            }
        }
    } catch (error) {
        console.error('Error generating personalized quiz:', error);
        showMessage('Failed to generate personalized quiz', 'error');
    }
}

async function generateWeeklyQuiz() {
    if (!currentUser) return;
    
    try {
        const weeklyTopics = ['Algebra', 'Calculus', 'Mechanics', 'Thermodynamics']; // This would come from actual weekly progress
        
        const response = await fetch('/api/quiz/weekly-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                weeklyTopics: weeklyTopics,
                examType: 'Weekly Progress',
                language: document.getElementById('language-selector').value
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            startQuiz(data.quiz);
        } else {
            showMessage('Failed to generate weekly quiz', 'error');
        }
    } catch (error) {
        console.error('Error generating weekly quiz:', error);
        showMessage('Failed to generate weekly quiz', 'error');
    }
}

function startQuiz(quiz) {
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    quizAnswers = {};
    quizStartTime = Date.now();
    
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'block';
    
    displayQuestion();
}

function displayQuestion() {
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) {
        finishQuiz();
        return;
    }
    
    const question = currentQuiz.questions[currentQuestionIndex];
    const quizContainer = document.getElementById('quiz-container');
    
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    
    quizContainer.innerHTML = `
        <div class="quiz-header">
            <h2>${currentQuiz.subject} - ${currentQuiz.topic || 'Quiz'}</h2>
            <p>Question ${currentQuestionIndex + 1} of ${currentQuiz.questions.length}</p>
        </div>
        
        <div class="quiz-progress">
            <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: #667eea; height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
            </div>
        </div>
        
        <div class="question-container">
            <div class="question-text">${question.question}</div>
            
            <div class="options-list">
                ${Object.entries(question.options).map(([key, value]) => `
                    <div class="option-item" onclick="selectOption('${key}')">
                        <input type="radio" name="question_${question.id}" value="${key}" ${quizAnswers[question.id] === key ? 'checked' : ''}>
                        <span>${key}) ${value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="quiz-actions">
            <button onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                Previous
            </button>
            <button onclick="nextQuestion()">
                ${currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </button>
        </div>
    `;
}

function selectOption(option) {
    const question = currentQuiz.questions[currentQuestionIndex];
    quizAnswers[question.id] = option;
    
    // Update UI to show selection
    const optionItems = document.querySelectorAll('.option-item');
    optionItems.forEach(item => item.classList.remove('selected'));
    
    const selectedItem = event.target.closest('.option-item');
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        finishQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

async function finishQuiz() {
    if (!currentUser) return;
    
    const timeTaken = Math.round((Date.now() - quizStartTime) / 1000 / 60); // in minutes
    let correctAnswers = 0;
    
    currentQuiz.questions.forEach(question => {
        if (quizAnswers[question.id] === question.correctAnswer) {
            correctAnswers++;
        }
    });
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    // Track progress
    try {
        await fetch('/api/progress/track-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                quizId: 'quiz_' + Date.now(),
                subject: currentQuiz.subject,
                topic: currentQuiz.topic || 'General',
                score: score,
                totalQuestions: currentQuiz.questions.length,
                timeTaken: timeTaken,
                answers: quizAnswers
            })
        });
    } catch (error) {
        console.error('Error tracking quiz progress:', error);
    }
    
    // Show results
    showQuizResults(score, correctAnswers, currentQuiz.questions.length, timeTaken);
}

function showQuizResults(score, correct, total, timeTaken) {
    const quizContainer = document.getElementById('quiz-container');
    
    quizContainer.innerHTML = `
        <div class="quiz-header">
            <h2>Quiz Results</h2>
        </div>
        
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3rem; font-weight: 700; color: ${score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'}; margin-bottom: 1rem;">
                ${score}%
            </div>
            <p style="font-size: 1.2rem; color: #666; margin-bottom: 2rem;">
                You got ${correct} out of ${total} questions correct
            </p>
            <p style="color: #666;">Time taken: ${timeTaken} minutes</p>
        </div>
        
        <div style="text-align: center;">
            <button onclick="closeQuiz()" style="background: #667eea; color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
                Close Quiz
            </button>
        </div>
    `;
}

function closeQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    currentQuiz = null;
    loadDashboard(); // Refresh dashboard stats
}

// Study Materials functionality
async function getStudyMaterials() {
    if (!currentUser) return;
    
    const subject = prompt('Enter subject:');
    const chapter = prompt('Enter chapter/topic:');
    const examType = prompt('Enter exam type (JEE/NEET/GATE/UPSC):');
    const language = document.getElementById('language-selector').value;
    
    if (!subject || !chapter || !examType) {
        showMessage('Please provide all required information', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/ai/study-materials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                subject: subject,
                chapter: chapter,
                examType: examType,
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showModal('Study Materials', data.materials);
        } else {
            showMessage('Failed to generate study materials', 'error');
        }
    } catch (error) {
        console.error('Error getting study materials:', error);
        showMessage('Failed to generate study materials', 'error');
    }
}

// Progress functionality
function viewProgress() {
    document.querySelector('a[href="#progress"]').click();
}

// Subject exploration
function exploreSubject(subject) {
    showModal(`${subject} Topics`, `
        <h3>Available Topics in ${subject}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            ${getSubjectTopics(subject).map(topic => `
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer;" onclick="exploreTopic('${subject}', '${topic}')">
                    <h4>${topic}</h4>
                </div>
            `).join('')}
        </div>
    `);
}

function getSubjectTopics(subject) {
    const topics = {
        'Mathematics': ['Algebra', 'Calculus', 'Trigonometry', 'Geometry', 'Statistics', 'Probability'],
        'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics', 'Wave Motion'],
        'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'],
        'Biology': ['Botany', 'Zoology', 'Human Physiology', 'Genetics', 'Ecology', 'Microbiology']
    };
    return topics[subject] || [];
}

async function exploreTopic(subject, topic) {
    if (!currentUser) return;
    
    const language = document.getElementById('language-selector').value;
    
    try {
        const response = await fetch('/api/ai/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                topic: topic,
                subject: subject,
                level: 'Intermediate',
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showModal(`${topic} - ${subject}`, data.explanation);
        } else {
            showMessage('Failed to get topic explanation', 'error');
        }
    } catch (error) {
        console.error('Error exploring topic:', error);
        showMessage('Failed to get topic explanation', 'error');
    }
}

// Modal functionality
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
}

// Language functionality
function updateLanguageSelector() {
    const languageSelector = document.getElementById('language-selector');
    languageSelector.addEventListener('change', function() {
        // Update UI language (in a real app, this would trigger translations)
        console.log('Language changed to:', this.value);
    });
}

// Utility functions
function setupEventListeners() {
    // Enter key in chat input
    document.getElementById('question-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendQuestion();
        }
    });
    
    // Modal close on overlay click
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Export functions for global access
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.openAITutor = openAITutor;
window.generateQuiz = generateQuiz;
window.getStudyMaterials = getStudyMaterials;
window.viewProgress = viewProgress;
window.exploreSubject = exploreSubject;
window.exploreTopic = exploreTopic;
window.askQuickQuestion = askQuickQuestion;
window.sendQuestion = sendQuestion;
window.generateMockTest = generateMockTest;
window.generatePersonalizedQuiz = generatePersonalizedQuiz;
window.generateWeeklyQuiz = generateWeeklyQuiz;
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.closeQuiz = closeQuiz;
window.closeModal = closeModal; 