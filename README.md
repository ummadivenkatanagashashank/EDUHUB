# EduHub - AI-Powered Learning Platform

EduHub is a comprehensive AI-powered learning platform designed to help students from Class 11 up to higher education exams like JEE, NEET, GATE, and UPSC. The platform provides subject explanations, study materials, and AI-generated mock tests with personalized learning paths.

## 🚀 Features

### Core Features
- **AI-Powered Tutoring**: Instant doubt-solving with Gemini AI
- **Smart Quiz Generation**: Personalized quizzes based on learning progress
- **Progress Tracking**: Comprehensive analytics and performance monitoring
- **Multilingual Support**: Learning in English, Hindi, and Telugu
- **Study Materials**: AI-generated comprehensive study resources
- **Mock Tests**: Full-length practice tests for competitive exams

### Key Capabilities
- **Adaptive Learning**: Automatically generates quizzes based on weekly progress
- **Personalized Recommendations**: AI-driven study suggestions
- **Real-time Analytics**: Track performance across subjects and topics
- **Interactive UI**: Modern, responsive design with beautiful animations
- **Multi-subject Support**: Mathematics, Physics, Chemistry, Biology, and more

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Integration**: Google Gemini API
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Google Gemini API Key** (Get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EDUHUB
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
1. Open the `config.env` file
2. Replace `your_gemini_api_key_here` with your actual Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
```

### 4. Start the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## 📁 Project Structure

```
EDUHUB/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # JavaScript functionality
├── routes/                # API routes
│   ├── ai.js             # AI-related endpoints
│   ├── quiz.js           # Quiz generation endpoints
│   └── progress.js       # Progress tracking endpoints
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
├── config.env            # Environment configuration
└── README.md             # Project documentation
```

## 🎯 API Endpoints

### AI Routes (`/api/ai`)
- `POST /tutor` - Get AI tutor responses
- `POST /explain` - Get topic explanations
- `POST /study-materials` - Generate study materials
- `POST /translate` - Translate educational content

### Quiz Routes (`/api/quiz`)
- `POST /generate-test` - Generate mock tests
- `POST /personalized-quiz` - Create personalized quizzes
- `POST /weekly-quiz` - Generate weekly progress quizzes

### Progress Routes (`/api/progress`)
- `POST /track-quiz` - Track quiz results
- `GET /dashboard/:studentId` - Get student dashboard
- `GET /subject/:studentId/:subject` - Get subject progress
- `GET /recommendations/:studentId` - Get learning recommendations

## 🎨 Features in Detail

### 1. Dashboard
- **Quick Stats**: Overview of subjects, quizzes, scores, and study time
- **Recent Activity**: Latest quiz attempts and performance
- **Quick Actions**: Easy access to main features

### 2. AI Tutor
- **Real-time Chat**: Interactive conversation with AI tutor
- **Subject Selection**: Choose specific subjects for targeted help
- **Quick Questions**: Pre-defined common questions
- **Multilingual Support**: Ask questions in English, Hindi, or Telugu

### 3. Quiz System
- **Mock Tests**: Full-length practice tests for competitive exams
- **Personalized Quizzes**: AI-generated based on learning progress
- **Weekly Progress Quizzes**: Test understanding of recent topics
- **Real-time Scoring**: Immediate feedback and performance tracking

### 4. Progress Tracking
- **Performance Analytics**: Detailed statistics and trends
- **Weak/Strong Topics**: AI-identified areas for improvement
- **Recommendations**: Personalized study suggestions
- **Learning Paths**: Adaptive curriculum recommendations

### 5. Study Materials
- **AI-Generated Content**: Comprehensive study resources
- **Subject-Specific**: Tailored materials for each subject
- **Exam-Focused**: Content aligned with competitive exams
- **Multilingual**: Available in multiple languages

## 🎯 Usage Guide

### Getting Started
1. **Access the Platform**: Open the application in your browser
2. **Explore Subjects**: Browse available subjects and topics
3. **Ask AI Tutor**: Get instant help with your doubts
4. **Take Quizzes**: Practice with AI-generated tests
5. **Track Progress**: Monitor your learning journey

### Using the AI Tutor
1. Navigate to the "AI Tutor" section
2. Select your subject from the dropdown
3. Type your question or use quick questions
4. Get instant, detailed explanations

### Taking Quizzes
1. Go to the "Quizzes" section
2. Choose quiz type (Mock Test, Personalized, or Weekly)
3. Select subject and topic (for mock tests)
4. Answer questions and track your progress
5. Review results and explanations

### Monitoring Progress
1. Visit the "Progress" section
2. View overall performance statistics
3. Identify weak and strong topics
4. Follow AI recommendations for improvement

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Customization
- **Subjects**: Add new subjects in `script.js` under `getSubjectTopics()`
- **Topics**: Modify topic lists for each subject
- **UI Colors**: Update CSS variables in `styles.css`
- **API Endpoints**: Extend routes in the `routes/` directory

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production` in `config.env`
2. Install dependencies: `npm install --production`
3. Start the server: `npm start`

### Docker Deployment (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Considerations

- **API Key Protection**: Never commit your API key to version control
- **Input Validation**: All user inputs are validated on both frontend and backend
- **CORS Configuration**: Configure CORS settings for production deployment
- **Rate Limiting**: Implement rate limiting for API endpoints in production

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**
   - Ensure your Gemini API key is correctly set in `config.env`
   - Verify the API key has proper permissions

2. **Port Already in Use**
   - Change the port in `config.env`
   - Kill processes using the default port

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check Node.js version compatibility

4. **CORS Issues**
   - Configure CORS settings in `server.js`
   - Check browser console for specific errors

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in `config.env`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini API** for AI capabilities
- **Font Awesome** for icons
- **Google Fonts** for typography
- **Express.js** community for the robust framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**EduHub** - Empowering students with AI-driven education! 🎓✨ #   E D U H U B  
 