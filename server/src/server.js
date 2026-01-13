require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');
const scraperRoutes = require('./routes/scraperRoutes');
const appsRoutes = require('./routes/apps.routes');

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development, restrict in production
        methods: ["GET", "POST"]
    }
});

// Make io accessible in routes/controllers
app.set('io', io);

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/apps', appsRoutes);
app.use('/api', apiRoutes);
app.use('/api', scraperRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Insightify API is running' });
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room based on appId to receive updates for that app
    socket.on('join_app', (appId) => {
        socket.join(appId);
        console.log(`User ${socket.id} joined room: ${appId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("DEBUG: Server routes updated - /api/apps should be active");
});
