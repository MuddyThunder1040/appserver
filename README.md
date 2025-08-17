# Express App Server

A comprehensive Node.js Express application with SQLite database integration, admin dashboard, and comprehensive testing suite.

## 🚀 Features

- **RESTful API**: Full CRUD operations for user management
- **Admin Dashboard**: Real-time activity logs and database statistics
- **SQLite Database**: Lightweight, file-based database with automatic initialization
- **Activity Logging**: Comprehensive request logging and monitoring
- **Modern UI**: Responsive web interface with gradient styling
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Testing Suite**: Complete test coverage with Jest and Supertest
- **Health Monitoring**: Built-in health checks and server status endpoints

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/MuddyThunder1040/appserver.git
   cd appserver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Development mode** (with auto-restart)
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

### Docker Deployment

1. **Using Docker Compose** (Recommended)
   ```bash
   docker-compose up -d
   ```

2. **Using Docker directly**
   ```bash
   # Build the image
   docker build -t express-app .
   
   # Run the container
   docker run -p 3000:3000 express-app
   ```

## 🧪 Testing

The application includes comprehensive test suites covering:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Admin Dashboard Tests**: UI and functionality testing
- **Database Tests**: Data persistence and retrieval

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers:
- API endpoints (`/api`, `/users`, `/health`, `/status`)
- Database operations (CRUD, logging, statistics)
- Admin functionality (logs, stats)
- Homepage integration
- Error handling and validation

## 📚 API Documentation

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Homepage with API overview |
| `GET` | `/health` | Health check and server metrics |
| `GET` | `/api` | API documentation |
| `GET` | `/status` | Detailed server information |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users` | Create new user |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user |
| `GET` | `/users-form` | User creation form |

### Admin Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/logs` | View activity logs |
| `GET` | `/admin/stats` | Database statistics |

### Example API Usage

#### Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }'
```

#### Get All Users
```bash
curl http://localhost:3000/users
```

#### Health Check
```bash
curl http://localhost:3000/health
```

## 💾 Database

The application uses SQLite with the following tables:

### Users Table
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `role` (TEXT, DEFAULT 'user')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Logs Table
- `id` (INTEGER, PRIMARY KEY)
- `level` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `endpoint` (TEXT)
- `user_agent` (TEXT)
- `ip_address` (TEXT)
- `created_at` (DATETIME)

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 3000)

### Docker Configuration

The application includes:
- **Dockerfile**: Multi-stage build for production
- **docker-compose.yml**: Complete stack configuration
- **Volume mounting**: For development with live reload
- **Environment setup**: Production-ready configuration

## 📊 Monitoring & Logging

### Activity Logging
- All HTTP requests are automatically logged
- Logs include timestamp, method, path, user agent, and IP
- Accessible via `/admin/logs` endpoint

### Health Monitoring
- Server uptime tracking
- Memory usage monitoring
- Request statistics
- Database connection status

### Admin Dashboard
- Real-time activity logs
- Database statistics (user count, log count)
- System information display
- Beautiful, responsive UI

## 🚀 Production Deployment

### Recommended Production Setup

1. **Environment Configuration**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **Process Management**
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start server.js --name "express-app"
   ```

3. **Reverse Proxy** (Nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🏗️ Project Structure

```
appserver/
├── server.js              # Main application file
├── database.js            # Database class and operations
├── package.json           # Dependencies and scripts
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── jest.config.json       # Jest testing configuration
├── app.db                 # SQLite database file
├── __tests__/             # Test files
│   ├── admin.test.js      # Admin dashboard tests
│   ├── api.test.js        # API endpoint tests
│   └── database.test.js   # Database operation tests
├── coverage/              # Test coverage reports
└── README.md              # This file
```

## 🔗 Related Projects

- [ANC Pipelines](../anc-pipelines/) - Jenkins CI/CD pipelines for this application
- [AWS Topology](../aws-topology/) - Infrastructure and deployment configurations
