const express = require('express');

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.send('Hello from Express server!');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Express API Server',
        version: '1.0.0',
        endpoints: [
            'GET /',
            'GET /health',
            'GET /api',
            'GET /users',
            'POST /users',
            'GET /users/:id',
            'GET /status',
            'POST /echo'
        ]
    });
});

// Mock users data
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user' }
];

// Get all users
app.get('/users', (req, res) => {
    res.json({
        success: true,
        data: users,
        count: users.length
    });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    
    if (user) {
        res.json({
            success: true,
            data: user
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }
});

// Create new user
app.post('/users', (req, res) => {
    const { name, email, role = 'user' } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: 'Name and email are required'
        });
    }
    
    const newUser = {
        id: users.length + 1,
        name,
        email,
        role
    };
    
    users.push(newUser);
    
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
    });
});

// Server status endpoint
app.get('/status', (req, res) => {
    res.json({
        server: 'Express.js',
        status: 'running',
        environment: process.env.NODE_ENV || 'development',
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
    });
});

// Echo endpoint for testing POST requests
app.post('/echo', (req, res) => {
    res.json({
        message: 'Echo response',
        receivedData: req.body,
        timestamp: new Date().toISOString(),
        method: req.method,
        headers: req.headers
    });
});

// 404 handler for undefined routes - must be last
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        requestedPath: req.path,
        method: req.method,
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api',
            'GET /users',
            'POST /users',
            'GET /users/:id',
            'GET /status',
            'POST /echo'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET  /');
    console.log('  GET  /health');
    console.log('  GET  /api');
    console.log('  GET  /users');
    console.log('  POST /users');
    console.log('  GET  /users/:id');
    console.log('  GET  /status');
    console.log('  POST /echo');
});