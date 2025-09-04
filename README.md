# EduAI - AI-Powered Study Planner & Learning Dashboard

A comprehensive full-stack application that helps users track their learning goals, discover educational content through YouTube integration, and receive AI-powered recommendations for personalized study plans.

## 🚀 Features

### Backend (Node.js + Express + MongoDB)
- **User Authentication**: JWT-based secure authentication system
- **Goal Management**: Create, track, and update learning goals with milestones
- **Lesson Tracking**: Monitor lesson progress, time spent, and completion status
- **YouTube Integration**: Search and save educational videos as lessons
- **AI-Powered Recommendations**: Smart study plans and lesson suggestions using OpenRouter API
- **Analytics**: Comprehensive learning analytics and progress tracking
- **RESTful API**: Well-structured API endpoints with proper error handling

### Frontend (React + Tailwind + Chart.js)
- **Modern Dashboard**: Colorful, interactive dashboard with learning statistics
- **Goal Management**: Intuitive goal creation and progress tracking
- **Lesson Library**: Organized lesson management with various content types
- **YouTube Search**: Integrated YouTube video search and bookmarking
- **Analytics Charts**: Beautiful data visualizations using Chart.js and Recharts
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **User Profile**: Comprehensive profile management with learning preferences

### AI Integration
- **Study Plan Generation**: AI-powered personalized study plans
- **Smart Recommendations**: Next lesson suggestions based on learning history
- **Progress Analysis**: AI insights into learning patterns and improvements
- **Goal Milestone Suggestions**: Automated milestone creation for learning goals

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **AI Integration**: OpenRouter API (Claude 3)
- **External APIs**: YouTube Data API v3

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS with custom components
- **Charts**: Chart.js, React-Chartjs-2, Recharts
- **Icons**: Heroicons
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier available)
- YouTube Data API key (optional, for video search)
- OpenRouter API key (for AI features)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   **MongoDB Atlas Setup**:
   1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   2. Create a free account and cluster
   3. Create a database user with read/write permissions
   4. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
   5. Get your connection string from "Connect" → "Connect your application"
   6. Replace `<username>`, `<password>`, and `<cluster-name>` in the MONGODB_URI above
   
   Update the following variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/eduai?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   FRONTEND_URL=http://localhost:3000
   YOUTUBE_API_KEY=your-youtube-api-key-here
   OPENROUTER_API_KEY=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
   ```

4. **Start the backend server**:
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

   Application will open at `http://localhost:3000`

### Database Setup

1. **Install MongoDB** (if not already installed):
   - Local installation: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
   - Or use MongoDB Atlas (cloud): [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## 🔑 API Keys Setup

### YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your `.env` file

### OpenRouter API
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Add it to your `.env` file (already included in the provided key)

## 🚀 Usage

1. **Register/Login**: Create an account or log in to existing account
2. **Set Learning Goals**: Create goals with categories, difficulty levels, and target dates
3. **Search YouTube Videos**: Find educational content and save as lessons
4. **Track Progress**: Monitor your learning progress through the dashboard
5. **View Analytics**: Analyze your learning patterns and performance
6. **AI Recommendations**: Get personalized study plans and lesson suggestions

## 📁 Project Structure

```
EduAI/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── server.js       # Express server setup
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── .env
└── README.md
```

## 🎯 Key Features Explained

### Smart Goal Management
- Create learning goals with AI-generated milestones
- Track progress with visual indicators
- Category-based organization
- Difficulty-based recommendations

### YouTube Integration
- Search educational videos
- Save videos as lessons
- Track video completion
- Channel information display

### AI-Powered Insights
- Personalized study plan generation
- Learning pattern analysis
- Smart lesson recommendations
- Progress insights and suggestions

### Comprehensive Analytics
- Daily/weekly/monthly progress charts
- Category-wise learning breakdown
- Time tracking and analysis
- Streak monitoring

## 🔧 Development

### Running in Development Mode

**Backend**:
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend**:
```bash
cd frontend
npm start    # React development server with hot reload
```

### Building for Production

**Backend**:
```bash
cd backend
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI API services
- [YouTube Data API](https://developers.google.com/youtube/v3) for video search
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Chart.js](https://www.chartjs.org/) for data visualization
- [Heroicons](https://heroicons.com/) for beautiful icons

## 📞 Support

If you have any questions or run into issues, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Learning! 🎓✨**
