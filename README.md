# 🏥 MediChat - AI Medical Assistant

A modern, full-stack medical chatbot application powered by AI, providing 24/7 health guidance, symptom analysis, and medication information.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/abid2004615/Ai_medical_chatbot)
[![License](https://img.shields.io/badge/License-Educational-green?style=for-the-badge)](https://github.com/abid2004615/Ai_medical_chatbot)

**Repository**: [https://github.com/abid2004615/Ai_medical_chatbot](https://github.com/abid2004615/Ai_medical_chatbot)

## ✨ Features

### 🤖 AI-Powered Health Assistant
- **Intelligent Chat**: Natural conversation with AI medical assistant
- **Smart Questioning**: Asks combined questions for faster diagnosis (1 question instead of 5)
- **Session Memory**: Remembers your symptoms, diagnoses, and medications within the session
- **Comprehensive Summaries**: Doctor-like diagnosis with medications, lifestyle advice, and warnings
- **Symptom Analysis**: Real-time symptom checker with AI-powered analysis
- **Medication Explorer**: Search and learn about medications
- **Health Records**: Track your consultation history

### 🎙️ Multi-Modal Input
- **Text Chat**: Type your symptoms and questions
- **Voice Input**: Speak your symptoms using voice recognition
- **Image Upload**: Upload medical images for analysis
- **Voice Response**: Listen to AI responses with text-to-speech

### 🎨 Modern UI/UX
- **Clean Design**: Professional medical-themed interface
- **Teal Color Scheme**: Calming, medical-appropriate colors
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished user experience

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript
- **Styling**: CSS with Tailwind CSS
- **UI Components**: Custom components with Radix UI
- **State Management**: React Hooks

### Backend
- **Framework**: Flask (Python)
- **AI Model**: Groq API
- **TTS**: ElevenLabs & Google TTS
- **Speech Recognition**: SpeechRecognition library
- **Image Processing**: Pillow (PIL)

## 📋 Prerequisites

- **Node.js**: 18.x or higher
- **Python**: 3.9 or higher
- **pnpm**: Package manager (or npm/yarn)
- **API Keys**:
  - Groq API key (for AI)
  - ElevenLabs API key (for TTS)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/abid2004615/Ai_medical_chatbot.git
cd Ai_medical_chatbot
```

### 2. Backend Setup

```bash
# Navigate to project root
cd Ai_medical_chatbot

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

**Create `.env` file in project root:**
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**Get your API keys:**
- **Groq API Key**: Sign up at [https://console.groq.com/](https://console.groq.com/)
- **ElevenLabs API Key**: Sign up at [https://elevenlabs.io/](https://elevenlabs.io/)

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (using pnpm)
pnpm install

# If you don't have pnpm installed:
npm install -g pnpm
```

**Create `frontend/.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAX_FILE_SIZE=16777216
```

### 4. Verify Installation

Check that all dependencies are installed correctly:

```bash
# Check Python packages
pip list

# Check Node packages
cd frontend
pnpm list
```

## 🎯 Running the Application

### Quick Start (Recommended)

Use the automated startup scripts to run both servers simultaneously:

**Windows:**
```bash
dev.bat
```

**Mac/Linux:**
```bash
chmod +x dev.sh  # Make executable (first time only)
./dev.sh
```

The scripts will:
- Check if Python and Node.js are installed
- Verify ports 3000 and 5000 are available
- Start both backend and frontend servers
- Display server URLs

### Manual Start (Alternative)

If you prefer to start servers manually:

**Start Backend Server:**
```bash
cd backend
python app.py
# Server runs on http://localhost:5000
```

**Start Frontend Development Server (in a new terminal):**
```bash
cd frontend
pnpm dev
# App runs on http://localhost:3000
```

### Verifying Backend is Running

Check if the backend is running by visiting:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "MediChat backend is running",
  "timestamp": 1699123456789,
  "version": "1.0.0"
}
```

## 📁 Project Structure

```
Ai_medical_chatbot/
├── backend/
│   ├── app.py                      # Main Flask application
│   ├── brain_of_the_doctor.py      # AI logic
│   ├── voice_of_the_doctor.py      # TTS functionality
│   ├── voice_of_the_patient.py     # Speech recognition
│   └── uploads/                    # Uploaded images
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Hero/Landing page
│   │   ├── chat/
│   │   │   └── page.tsx           # Chat interface
│   │   ├── globals.css            # Global styles
│   │   └── hero.css               # Hero page styles
│   ├── components/
│   │   └── chat/                  # Chat components
│   ├── lib/
│   │   └── api-client.ts          # API integration
│   └── package.json               # Node dependencies
│
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: #0ABABA (Teal)
- **Primary Dark**: #0097A7
- **Background**: #F8FBFD (Light blue-gray)
- **Text Primary**: #001B2E (Dark blue-black)
- **Text Secondary**: #4F5B66 (Medium gray)

### Key Features
- Medical symbol (⚕️) branding
- Rounded corners and soft shadows
- Smooth transitions and animations
- Accessible color contrast

## 🔧 Configuration

### Backend Environment Variables
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
FLASK_ENV=development
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAX_FILE_SIZE=16777216
```

## 🔧 Troubleshooting

### "Failed to fetch" or "Backend server is not running"

**Problem:** Frontend cannot connect to the backend.

**Solutions:**
1. Make sure the backend server is running on port 5000
2. Check the backend terminal for error messages
3. Verify your `.env` file contains valid API keys:
   - `GROQ_API_KEY` - Get from [Groq Console](https://console.groq.com/)
   - `ELEVENLABS_API_KEY` - Get from [ElevenLabs](https://elevenlabs.io/)
4. Visit `http://localhost:5000/api/health` to verify backend is running
5. Check if another application is using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

### Port Already in Use

**Problem:** Error message says port 3000 or 5000 is already in use.

**Solutions:**
1. Stop the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -i :5000
   kill -9 <PID>
   ```
2. Or change the port in configuration files

### CORS Errors

**Problem:** Browser console shows CORS policy errors.

**Solutions:**
1. Verify backend CORS configuration includes your frontend URL
2. Make sure you're accessing frontend via `http://localhost:3000` (not `127.0.0.1`)
3. Clear browser cache and reload
4. Check backend console for CORS-related errors

### Missing Dependencies

**Problem:** Import errors or module not found errors.

**Solutions:**
1. **Backend:** Reinstall Python dependencies
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Frontend:** Reinstall Node dependencies
   ```bash
   cd frontend
   rm -rf node_modules
   pnpm install
   ```

### API Key Errors

**Problem:** Backend crashes with API key errors.

**Solutions:**
1. Create a `.env` file in the project root (not in backend folder)
2. Add your API keys:
   ```env
   GROQ_API_KEY=your_actual_key_here
   ELEVENLABS_API_KEY=your_actual_key_here
   ```
3. Restart the backend server
4. Verify keys are valid by checking the respective service dashboards

### Frontend Build Errors

**Problem:** Next.js build or dev server fails to start.

**Solutions:**
1. Clear Next.js cache:
   ```bash
   cd frontend
   rm -rf .next
   pnpm dev
   ```
2. Check Node.js version (requires 18.x or higher):
   ```bash
   node --version
   ```
3. Update dependencies:
   ```bash
   pnpm install
   ```

### Voice Recording Not Working

**Problem:** Microphone access denied or voice recording fails.

**Solutions:**
1. Grant microphone permissions in your browser
2. Use HTTPS or localhost (required for microphone access)
3. Check browser console for specific errors
4. Try a different browser

### Image Upload Fails

**Problem:** Image upload returns an error.

**Solutions:**
1. Check file size (max 16MB)
2. Verify file format (JPEG, PNG, GIF supported)
3. Check backend `uploads/` folder exists and is writable
4. Review backend console for specific errors

### Checking Port Availability

Before starting servers, verify ports are available:

**Windows:**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

**Mac/Linux:**
```bash
lsof -i :3000
lsof -i :5000
```

If ports are in use, either stop those processes or configure different ports.

### Getting Help

If you're still experiencing issues:
1. Check the browser console (F12) for error messages
2. Check the backend terminal for Python errors
3. Review the [GitHub Issues](https://github.com/abid2004615/Ai_medical_chatbot/issues)
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, Python version)

## 📱 Features in Detail

### Chat Interface
- Real-time messaging with AI
- Message history saved in browser
- Typing indicators
- Voice and image input options
- Quick suggestion buttons

### Symptom Checker
- Add symptoms via text, voice, or image
- AI-powered symptom analysis
- Safety notices and disclaimers
- Personalized health recommendations

### Medication Explorer
- Search medications by name
- Detailed medication information
- Common medications quick access
- Safety warnings and usage guidelines

### Health Records
- View consultation history
- Clear chat history option
- Local storage (privacy-focused)

## 🔒 Privacy & Security

- **Local Storage**: Chat history stored in browser only
- **No Data Collection**: No personal data sent to external servers
- **HIPAA Awareness**: Designed with healthcare privacy in mind
- **Disclaimers**: Clear medical disclaimers throughout

## ⚠️ Important Disclaimer

**MediChat is an AI assistant for educational purposes only. It is NOT a replacement for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.**

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository: https://github.com/abid2004615/Ai_medical_chatbot
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

## 👨‍💻 Development

### Code Style
- **Frontend**: TypeScript with strict mode
- **Backend**: Python with type hints
- **Formatting**: Consistent indentation and naming

### Testing
- Test all features before committing
- Verify API endpoints work correctly
- Check responsive design on multiple devices

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python virtual environment is activated
- Check API keys are correctly set in .env
- Verify all dependencies are installed

### Frontend Issues
- Clear .next cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check backend is running on correct port

## 📞 Support

For issues or questions:
1. Open an issue on GitHub: https://github.com/abid2004615/Ai_medical_chatbot/issues
2. Check existing documentation
3. Review error messages carefully
4. Ensure all dependencies are installed
5. Verify API keys are valid

## 🎉 Acknowledgments

- **Groq**: AI model provider
- **ElevenLabs**: Text-to-speech service
- **Next.js**: React framework
- **Flask**: Python web framework

---

**Built with ❤️ for better healthcare accessibility**
