# Fusha Platform Mobile (فسحة)

<p align="center">
  <img width="297" alt="logo" src="https://github.com/user-attachments/assets/ef6b9564-6dcc-45fd-9e53-0cdccfdbbeb4" />
  <em>Your guided travel companion in your pocket</em>
</p>

## 🌟 Overview

Fusha Platform Mobile (فسحة) is a comprehensive travel companion app that brings the power of personalized trip planning to your mobile device. Built with React Native and Expo, this app allows users to explore destinations, create custom travel experiences, and manage their trips - all through an intuitive Arabic interface optimized for mobile devices.

<p align="center">
  <a href="#features">✨ Features</a> •
  <a href="#technical-stack">🛠️ Tech Stack</a> •
  <a href="#screens">📱 Screens</a> •
  <a href="#installation">🚀 Installation</a>
</p>

## ✨ Features

### For Travelers
- **Personalized Trip Creation**: Build your own trip with a streamlined mobile workflow
- **Trip Types & Categories**: Browse visual categories for different trip experiences
- **Interactive Destination Explorer**: Discover places with smooth transitions and animations
- **Budget Management**: Plan trips according to your specific budget with intuitive controls
- **Trip Timeline**: Visualize your trip's route with an animated timeline
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Offline Capabilities**: Access key information without internet connection
- **Notifications Center**: Stay updated with trip alerts and reminders
- **Review System**: Rate and share your experiences with other users
- **Trip Gallery**: View high-quality images of destinations

### Mobile-Specific Features
- **Responsive Touch Interface**: Optimized for one-handed mobile interaction
- **Smooth Animations**: Enhanced user experience with fluid transitions
- **Offline Mode**: Access saved trips and essential information without internet
- **Native Device Integration**: Access camera for profile photos
- **Push Notifications**: Get timely updates about your trips
- **Gesture Navigation**: Intuitive swipe gestures for navigation

## 🛠️ Technology Stack

### Mobile App
- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolkit for React Native
- **React Navigation**: Screen navigation with native stack and bottom tabs
- **MotiView/Reanimated**: Advanced animations for fluid user experience
- **AsyncStorage**: Local data persistence
- **Context API**: State management with ThemeContext for dark/light mode
- **Axios**: API requests with interceptors
- **Vector Icons**: Various icon packs for enhanced UI
- **Linear Gradient**: Smooth color transitions for UI elements
- **Carousel**: Image gallery for destinations

## 📱 Screens

### Main Navigation
- **Home**: Featured trips, categories, and upcoming events
- **Explore**: Discover places and trip programs with filtering
- **Create Trip**: Step-by-step trip builder with selections for:
  - Number of travelers
  - Budget
  - Destination
  - Trip category
- **Reviews**: User feedback and ratings
- **Settings**: Profile management, theme toggling, notifications

### Authentication
- **Login**: Secure authentication with form validation
- **Register**: User registration with multi-step verification
- **Startup**: Animated splash screen with auto-login

## 📂 Project Structure
FushaPlatform-Mobile/
├── assets/ # Images, fonts and static assets
├── components/ # Reusable UI components
│ ├── Create/ # Trip creation workflow
│ ├── Explore/ # Destination discovery
│ ├── Final/ # Trip confirmation
│ ├── Next/ # Place selection
│ ├── Notifications/ # Notifications center
│ ├── PersonalInfo/ # User profile management
│ ├── Review/ # Ratings and reviews
│ ├── Setting/ # App preferences
│ └── Trips/ # Trip management
├── screens/ # Main app screens
│ ├── Home/ # Home screen
│ ├── Login/ # Authentication screens
│ ├── Register/ # User registration
│ └── StartupScreen.jsx # Initial loading screen
├── context/ # React Context providers
│ └── ThemeContext.js # Dark/light theme management
├── App.js # Main application component
└── index.js # Entry point

## 🚀 Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Setting up the development environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FushaPlatform-Mobile.git
   cd FushaPlatform-Mobile
Install dependencies

bash
npm install
# or
yarn install
🌐 Key Features Implementation
Theme System
The app features a complete dark/light theme system using React's Context API:

User preference is saved to AsyncStorage

Real-time theme switching without app restart

Theme-aware components throughout the app

Animations
Fluid user experience through:

MotiView for declarative animations

React Native Animated API for complex interactions

Loading state animations with custom designs

Scroll-based header transformations

Trip Creation Flow
Intuitive step-by-step process:

Initial details (travelers, budget, location)

Visual category selection with dynamic grid

Destination browsing with search and filters

Timeline visualization and confirmation

🔮 Roadmap
Offline Maps: Download maps for offline navigation

AR Features: Augmented reality for place discovery

Voice Assistant: Voice commands for hands-free operation

Trip Sharing: Share trip plans with friends and family

Payment Integration: In-app booking and payment processing

Biometric Authentication: Secure login with fingerprint/face recognition

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository

Create your feature branch:

bash
git checkout -b feature/amazing-feature
Commit your changes:

bash
git commit -m 'Add some amazing feature'
Push to the branch:

bash
git push origin feature/amazing-feature
Open a Pull Request

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
