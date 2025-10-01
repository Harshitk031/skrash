# Skrash - Multiplayer Drawing Game

A modern, React-based multiplayer drawing and guessing game built with Socket.IO.

## 🎮 Features

- **Real-time Drawing**: Collaborative canvas with multiple players
- **Word Guessing**: Players guess the word being drawn
- **Multiplayer Support**: Multiple players can join and play together
- **Scoring System**: Points awarded for correct guesses
- **Chat System**: In-game chat for communication
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd skrash
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the development server**
   ```bash
   # Start the backend server
   npm run dev
   
   # In a new terminal, start the React client
   npm run client
   ```

5. **Open your browser**
   - App: http://localhost:5000 (server serves the React build in prod)
   - Dev: React dev server via `npm run client` proxies to `http://localhost:5000`

## 🏗️ Project Structure

```
skrash/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   │   ├── images/        # Game images
│   │   └── sfx/           # Sound effects
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server.js              # Express + Socket.IO server
├── package.json           # Server dependencies
└── README.md
```

## 🔄 Migration from HTML/CSS/JS to React

### What Changed

1. **Architecture**: Converted from vanilla JavaScript to React with hooks
2. **State Management**: Replaced direct DOM manipulation with React state
3. **Component Structure**: Broke down the monolithic app into reusable components
4. **Styling**: Modernized CSS with responsive design and animations
5. **Socket Integration**: Integrated Socket.IO client with React lifecycle

### Key Components

- **App.js**: Main application state and routing
- **LoginScreen**: Player authentication and room joining
- **GameScreen**: Main game interface with canvas and tools
- **Canvas**: Drawing functionality with touch and mouse support
- **Chat**: Real-time messaging system
- **PlayerList**: Player roster with scores and rankings

### Socket Events

The React app maintains the same socket events as the original:
- `playerName`: Player joins the game
- `startGame`: Host starts the game
- `position`: Drawing coordinates
- `updateText`: Chat messages and word guesses
- `chosenWord`: Word selection for drawing
- And many more...

## 🎨 UI/UX Improvements

### Design Changes
- **Modern Color Scheme**: Gradient backgrounds and consistent theming
- **Responsive Layout**: Adapts to different screen sizes
- **Smooth Animations**: Fade-in effects, hover states, and transitions
- **Better Typography**: Improved readability and hierarchy
- **Touch Support**: Mobile-friendly interface

### Responsive Breakpoints
- **Desktop**: Full layout with sidebars
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Stacked layout for better mobile experience

## 🛠️ Development

### Available Scripts

```bash
# Server
npm start          # Start production server
npm run dev        # Start development server with nodemon

# Client
npm run client     # Start React development server
npm run build      # Build React app for production
npm run install-client  # Install client dependencies
```

### Building for Production

```bash
# Build the React app
npm run build

# The built files will be in client/build/
# The server will serve these static files
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)

### Game Settings
- Drawing time: 80 seconds
- Word selection time: 20 seconds
- Score calculation: Based on guess order and time

## 🚀 Deployment

### Heroku
```bash
# The app is configured for Heroku deployment
# It will automatically build the React app and serve it
git push heroku main
```

### Other Platforms
1. Build the React app: `npm run build`
2. Copy `client/build/` contents to your static hosting
3. Deploy `server.js` to your Node.js hosting platform

## 🐛 Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check if the server is running
   - Verify the proxy setting in client/package.json

2. **Canvas Not Drawing**
   - Ensure the user has drawing permissions
   - Check browser console for errors

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Original game concept inspired by Skribbl.io
- Built with React, Socket.IO, and modern web technologies
- Special thanks to the open-source community

---

**Happy Drawing! 🎨✍️**
 
