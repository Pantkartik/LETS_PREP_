# LETS_PREP - Competitive Programming Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

**LETS_PREP** is a real-time educational platform designed to streamline coding education through virtual classrooms and live competitive programming contests. In modern academic and technical training environments, educators often rely on disjointed tools for curriculum management, code compilation, and student assessment. This fragmentation leads to inefficiencies, administrative overhead, delayed feedback loops, and a lack of cohesive performance tracking.

- **LETS_PREP** addresses these challenges by offering a centralized environment where teachers can collaboratively manage classrooms, curate problem sets, and host live coding battles with automated grading.
- The platform ensures seamless code execution across multiple languages (Python, Java, C++, JavaScript), maintains real-time leaderboards for student engagement, enforces secure role-based access control, and provides a scalable backend capable of handling concurrent submissions with low latency.

The project demonstrates practical implementation of modern full-stack development, real-time database synchronization, secure code execution architecture, and cloud-native authentication practices. It is suitable for academic evaluation as well as a professional portfolio-grade project.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### For Students
- 🎯 **Interactive Code Editor** - Multi-language support (Python, JavaScript, Java, C++, Go, Rust)
- ⚡ **Real-time Code Execution** - Fast and secure code execution environment
- 🏆 **Battle Rooms** - Compete with peers in real-time coding challenges
- 📊 **Analytics Dashboard** - Track your progress and performance metrics
- 🎓 **Problem Library** - Curated collection of coding problems with varying difficulty
- 🔥 **Leaderboards** - Global and room-specific rankings

### For Teachers
- 👥 **Student Management** - Monitor student progress and performance
- 🎮 **Competition Creation** - Create and manage coding competitions
- 📈 **Analytics & Insights** - Detailed analytics on student performance
- 🔗 **Room Management** - Create and manage battle rooms with join links

### Platform Features
- 🔐 **Secure Authentication** - Supabase-powered authentication with role-based access
- 🌙 **Dark/Light Mode** - Beautiful UI with theme support
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Performance Optimized** - Built with Next.js 16 and Turbopack
- 🔄 **Real-time Updates** - WebSocket-based live updates

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebSockets
- **Code Execution**: Docker containers (isolated environments)

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Deployment**: Vercel (Frontend), Custom (Backend)

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git
- Docker (for code execution features)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pantkartik/LETS_PREP_.git
   cd LETS_PREP_
   ```

2. **Install Frontend dependencies**
   ```bash
   cd Frontend
   npm install
   ```

3. **Install Backend dependencies**
   ```bash
   cd ../Backend
   npm install
   ```

4. **Set up environment variables**

   **Frontend** (`Frontend/.env.local`):
   ```bash
   cp Frontend/.env.example Frontend/.env.local
   # Edit .env.local with your Supabase credentials
   ```

   **Backend** (`Backend/.env`):
   ```bash
   cp Backend/.env.example Backend/.env
   # Edit .env with your configuration
   ```

5. **Start the development servers**

   **Frontend** (Terminal 1):
   ```bash
   cd Frontend
   npm run dev
   ```

   **Backend** (Terminal 2):
   ```bash
   cd Backend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📁 Project Structure

```
LETS_PREP_/
├── Frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── dashboard/      # Student dashboard
│   │   ├── teacher/        # Teacher portal
│   │   ├── analytics/      # Analytics page
│   │   └── competitions/   # Competitions page
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   └── ...            # Custom components
│   ├── lib/               # Utility functions
│   ├── public/            # Static assets
│   └── styles/            # Global styles
│
├── Backend/                # Backend API server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   ├── logs/              # Application logs
│   └── .env.example       # Environment template
│
├── .gitignore             # Git ignore rules
├── README.md              # This file
└── LICENSE                # MIT License
```

## 🔐 Environment Variables

### Frontend Environment Variables

Create `Frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Backend Environment Variables

Create `Backend/.env`:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

See `.env.example` files for complete configuration options.

## 💻 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production

**Frontend**:
```bash
cd Frontend
npm run build
npm start
```

**Backend**:
```bash
cd Backend
npm run build
npm start
```

## 🚢 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Backend

1. Set up your server (AWS, DigitalOcean, etc.)
2. Configure environment variables
3. Set up Docker for code execution
4. Deploy using PM2 or similar process manager

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Pantkartik** - [GitHub](https://github.com/Pantkartik)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components
- All contributors and supporters

## 📞 Support

For support, email kartikpant.kp69@gmail.com or open an issue in the GitHub repository.

---

**Built with ❤️ for competitive programmers**
