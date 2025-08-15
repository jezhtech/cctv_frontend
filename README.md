# Smart Attendance Frontend

A modern, production-level React frontend for the Smart Attendance System with facial recognition capabilities.

## Features

- 🎨 **Modern UI/UX** - Built with React 19, TypeScript, and Tailwind CSS
- 🌓 **Theme Support** - Light, dark, and system theme modes
- 📱 **Responsive Design** - Mobile-first approach with responsive layouts
- 🔐 **Authentication Ready** - Prepared for user authentication and authorization
- 📊 **Real-time Data** - Live camera streams and attendance monitoring
- 🎯 **Modular Architecture** - Reusable components and clean code structure

## Pages

- **Dashboard** - Overview of system statistics and recent activities
- **Cameras** - Manage and monitor camera streams in grid format
- **Users** - User management with search and filtering
- **Attendance** - View attendance records and history
- **Analytics** - System insights and performance metrics
- **Activity Log** - Monitor system events and activities
- **Settings** - Application preferences and system configuration

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks and context
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-attendance
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your backend API URL in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
pnpm build
```

Preview the production build:
```bash
pnpm preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Layout components
├── contexts/           # React contexts (theme, auth, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and API client
├── pages/              # Page components
└── utils/              # Helper functions
```

## API Integration

The frontend is designed to work with the Smart Attendance Backend API. The API client (`src/lib/api.ts`) provides:

- **Camera Management** - CRUD operations for cameras
- **User Management** - User operations and authentication
- **Attendance Tracking** - Attendance records and statistics
- **Stream Management** - Camera stream controls
- **System Health** - Health checks and monitoring

## Theme System

The application supports three theme modes:
- **Light** - Clean, bright interface
- **Dark** - Easy on the eyes for low-light environments
- **System** - Automatically follows OS preference

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
