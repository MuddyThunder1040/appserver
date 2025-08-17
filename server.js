const express = require('express');
const Database = require('./database');

const app = express();
const PORT = 3000;

// Initialize database
const db = new Database();

// Middleware to parse JSON
app.use(express.json());
// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(async (req, res, next) => {
    try {
        await db.logActivity(
            'INFO', 
            `${req.method} ${req.path}`, 
            req.path,
            req.get('User-Agent'),
            req.ip
        );
    } catch (error) {
        console.error('Logging error:', error);
    }
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Express Server Home</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                h1 { color: #fff; text-align: center; margin-bottom: 30px; }
                .endpoints { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }
                .endpoint { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; transition: transform 0.3s; }
                .endpoint:hover { transform: translateY(-5px); }
                .endpoint a { color: #fff; text-decoration: none; font-weight: bold; }
                .endpoint a:hover { text-decoration: underline; }
                .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-right: 10px; }
                .get { background: #28a745; }
                .post { background: #007bff; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🚀 Express Server API</h1>
                <p style="text-align: center; font-size: 18px;">Welcome to the Express.js API Server!</p>
                
                <div class="endpoints">
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/health">Health Check</a>
                        <p>Server health and metrics</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/api">API Info</a>
                        <p>API documentation and endpoints</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/users">All Users</a>
                        <p>View all registered users</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/users/1">User Details</a>
                        <p>View specific user information</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/status">Server Status</a>
                        <p>Detailed server information</p>
                    </div>
                    <div class="endpoint">
                        <span class="method post">POST</span>
                        <a href="/users-form">Create User</a>
                        <p>Add new user (form)</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/admin/logs">Activity Logs</a>
                        <p>View system activity logs</p>
                    </div>
                    <div class="endpoint">
                        <span class="method get">GET</span>
                        <a href="/admin/stats">Database Stats</a>
                        <p>View database statistics</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <p>💾 Database: SQLite | Server running on Node.js ${process.version}</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    };
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Health Check</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
                .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                .status { font-size: 24px; text-align: center; margin-bottom: 20px; }
                .healthy { color: #00ff88; }
                .metric { background: rgba(255,255,255,0.2); padding: 15px; margin: 10px 0; border-radius: 8px; }
                .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🏥 Health Check</h1>
                <div class="status healthy">✅ Server is ${healthData.status.toUpperCase()}</div>
                
                <div class="metric">
                    <strong>Timestamp:</strong> ${healthData.timestamp}
                </div>
                <div class="metric">
                    <strong>Uptime:</strong> ${Math.floor(healthData.uptime)} seconds
                </div>
                <div class="metric">
                    <strong>Version:</strong> ${healthData.version}
                </div>
                <div class="metric">
                    <strong>Memory Usage:</strong> ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
                </div>
                
                <a href="/" class="back-btn">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
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

// Helper function to escape HTML
function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Users List</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                    .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                    .user-card { background: rgba(255,255,255,0.2); padding: 20px; margin: 15px 0; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
                    .user-info h3 { margin: 0 0 5px 0; }
                    .user-info p { margin: 0; opacity: 0.8; }
                    .role { padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                    .admin { background: #ff6b6b; }
                    .user { background: #4ecdc4; }
                    .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
                    .stats { text-align: center; margin-bottom: 20px; font-size: 18px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>👥 Users Directory</h1>
                    <div class="stats">Total Users: ${users.length}</div>
                    
                    ${users.map(user => `
                        <div class="user-card">
                            <div class="user-info">
                                <h3>${escapeHtml(user.name)}</h3>
                                <p>📧 ${escapeHtml(user.email)}</p>
                                <p>🆔 ID: ${user.id}</p>
                                <p>📅 Created: ${new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <div class="role ${user.role}">${user.role.toUpperCase()}</div>
                        </div>
                    `).join('')}
                
                <a href="/" class="back-btn">← Back to Home</a>
                <a href="/users-form" class="back-btn">➕ Add New User</a>
            </div>
        </body>
        </html>
    `);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error');
    }
});

// Get user by ID
app.get('/users/:id', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = await db.getUserById(userId);
        
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
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

// Create new user
app.post('/users', async (req, res) => {
    try {
        const { name, email, role = 'user' } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }
        
        const newUser = await db.createUser(escapeHtml(name), escapeHtml(email), role);
        
        res.status(201).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Created</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
                .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); text-align: center; }
                .success { font-size: 48px; margin-bottom: 20px; }
                .user-details { background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0; }
                .back-btn { display: inline-block; margin: 10px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success">✅</div>
                <h1>User Created Successfully!</h1>
                
                <div class="user-details">
                    <h3>${newUser.name}</h3>
                    <p>📧 ${newUser.email}</p>
                    <p>👤 Role: ${newUser.role}</p>
                    <p>🆔 ID: ${newUser.id}</p>
                </div>
                
                <a href="/users" class="back-btn">👥 View All Users</a>
                <a href="/users-form" class="back-btn">➕ Add Another User</a>
                <a href="/" class="back-btn">🏠 Home</a>
            </div>
        </body>
        </html>
    `);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

// User creation form
app.get('/users-form', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Create New User</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input, select { width: 100%; padding: 12px; border: none; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
                button { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; }
                button:hover { opacity: 0.9; }
                .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>➕ Create New User</h1>
                
                <form action="/users" method="POST">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" required placeholder="Enter full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" required placeholder="Enter email address">
                    </div>
                    
                    <div class="form-group">
                        <label for="role">Role</label>
                        <select id="role" name="role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    
                    <button type="submit">Create User</button>
                </form>
                
                <a href="/users" class="back-btn">👥 View All Users</a>
                <a href="/" class="back-btn">🏠 Home</a>
            </div>
        </body>
        </html>
    `);
});

// Server status endpoint
app.get('/status', (req, res) => {
    const statusData = {
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
    };
    
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Status</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); color: #333; }
                .container { background: rgba(255,255,255,0.9); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .status-item { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
                .status-item h3 { margin: 0 0 10px 0; font-size: 14px; opacity: 0.8; }
                .status-item .value { font-size: 18px; font-weight: bold; }
                .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #667eea; border-radius: 5px; text-decoration: none; color: white; }
                .running { color: #28a745; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 Server Status</h1>
                <p>Status: <span class="running">🟢 ${statusData.status.toUpperCase()}</span></p>
                
                <div class="status-grid">
                    <div class="status-item">
                        <h3>SERVER</h3>
                        <div class="value">${statusData.server}</div>
                    </div>
                    <div class="status-item">
                        <h3>ENVIRONMENT</h3>
                        <div class="value">${statusData.environment}</div>
                    </div>
                    <div class="status-item">
                        <h3>MEMORY USED</h3>
                        <div class="value">${statusData.memory.used}</div>
                    </div>
                    <div class="status-item">
                        <h3>MEMORY TOTAL</h3>
                        <div class="value">${statusData.memory.total}</div>
                    </div>
                    <div class="status-item">
                        <h3>PROCESS ID</h3>
                        <div class="value">${statusData.pid}</div>
                    </div>
                    <div class="status-item">
                        <h3>PLATFORM</h3>
                        <div class="value">${statusData.platform}</div>
                    </div>
                    <div class="status-item">
                        <h3>NODE VERSION</h3>
                        <div class="value">${statusData.nodeVersion}</div>
                    </div>
                    <div class="status-item">
                        <h3>UPTIME</h3>
                        <div class="value">${Math.floor(process.uptime())}s</div>
                    </div>
                </div>
                
                <a href="/" class="back-btn">← Back to Home</a>
            </div>
        </body>
        </html>
    `);
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

// Database admin endpoints
app.get('/admin/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const logs = await db.getLogs(limit);
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>System Logs</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #2c3e50 0%, #4a6741 100%); color: white; }
                    .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                    .log-entry { background: rgba(255,255,255,0.1); padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3498db; }
                    .log-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .log-time { color: #bdc3c7; font-size: 12px; }
                    .log-level { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
                    .log-level.INFO { background: #3498db; }
                    .log-level.ERROR { background: #e74c3c; }
                    .log-level.WARN { background: #f39c12; }
                    .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📋 System Activity Logs</h1>
                    <p>Showing last ${logs.length} entries</p>
                    
                    ${logs.map(log => `
                        <div class="log-entry">
                            <div class="log-header">
                                <span class="log-level ${log.level}">${log.level}</span>
                                <span class="log-time">${new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div><strong>${escapeHtml(log.message)}</strong></div>
                            ${log.endpoint ? `<div>Endpoint: ${escapeHtml(log.endpoint)}</div>` : ''}
                            ${log.user_agent ? `<div>User Agent: ${escapeHtml(log.user_agent)}</div>` : ''}
                        </div>
                    `).join('')}
                    
                    <a href="/" class="back-btn">← Back to Home</a>
                    <a href="/admin/stats" class="back-btn">📊 View Stats</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error');
    }
});

app.get('/admin/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Database Statistics</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%); color: white; }
                    .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; backdrop-filter: blur(10px); }
                    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
                    .stat-card { background: rgba(255,255,255,0.2); padding: 25px; border-radius: 10px; text-align: center; }
                    .stat-number { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
                    .stat-label { font-size: 14px; opacity: 0.8; text-transform: uppercase; }
                    .back-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: rgba(255,255,255,0.3); border-radius: 5px; text-decoration: none; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📊 Database Statistics</h1>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalUsers}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.adminUsers}</div>
                            <div class="stat-label">Admin Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalLogs}</div>
                            <div class="stat-label">Total Log Entries</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${stats.recentLogs}</div>
                            <div class="stat-label">Recent Activity (1h)</div>
                        </div>
                    </div>
                    
                    <a href="/" class="back-btn">← Back to Home</a>
                    <a href="/admin/logs" class="back-btn">📋 View Logs</a>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Database error');
    }
});

// Initialize database and start server
async function startServer() {
    try {
        await db.init();
        
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
            console.log('  GET  /admin/logs');
            console.log('  GET  /admin/stats');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close();
    process.exit(0);
});

// Start the server
startServer();
    console.log('  GET  /health');
// Export app for testing (only when not starting the server directly)
if (require.main !== module) {
    // For testing, we need to make admin endpoints available
    // without starting the database async initialization
    module.exports = app;
} else {
    // Only run startServer when this file is executed directly
    startServer();
}