# Library Management System

A comprehensive RESTful API-based library management system built with Express.js and Node.js. This system provides complete functionality for managing books, library members, and borrowing operations with advanced features like overdue tracking and fine calculations.

## 🚀 Features

### 📚 Books Management
- **Add New Books**: Register books with complete details including ISBN, genre, and copy counts
- **Update Book Information**: Modify book details and manage inventory
- **Search & Filter**: Find books by title, author, genre, or availability status
- **Inventory Tracking**: Monitor total and available copies of each book
- **Delete Books**: Remove books from the system (with safety checks for borrowed books)

### 👥 Member Management
- **Member Registration**: Register new library members with contact information
- **Profile Management**: Update member details and account status
- **Borrowing History**: Track complete borrowing history for each member
- **Member Status**: Manage active/inactive member accounts
- **Account Deletion**: Remove members (with checks for active borrowings)

### 📖 Borrowing System
- **Book Borrowing**: Complete borrowing workflow with due date management
- **Return Processing**: Handle book returns with automatic fine calculations
- **Due Date Tracking**: 14-day default borrowing period (configurable)
- **Duplicate Prevention**: Prevent members from borrowing the same book multiple times
- **Availability Checking**: Real-time availability verification

### 💰 Fine Management
- **Automatic Calculations**: $1 per day fine for overdue books
- **Overdue Tracking**: Comprehensive overdue book monitoring
- **Fine Reporting**: Detailed fine calculations and estimates
- **Grace Period**: Return books on time to avoid fines

### 📊 Statistics & Reports
- **Library Overview**: Total books, members, and borrowing statistics
- **Real-time Metrics**: Current availability and borrowing status
- **Overdue Reports**: List of overdue books with fine calculations
- **Member Activity**: Individual member borrowing patterns

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js framework
- **Runtime**: Node.js (Latest LTS)
- **API Style**: RESTful API with JSON responses
- **Data Storage**: In-memory storage (easily extendable to databases)
- **Process Management**: PM2 ready for production deployment
- **Web Server**: Nginx reverse proxy configuration included

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (Node Package Manager)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/MuddyThunder1040/appserver.git
cd appserver

# Install dependencies
npm install

# Start the development server
npm start
```

The server will start on `http://localhost:3001`

## 🔗 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication
Currently, the API doesn't require authentication (suitable for internal library networks).

## 📚 Books API

### Get All Books
```http
GET /api/books
```

**Query Parameters:**
- `genre` - Filter by genre (partial match)
- `author` - Filter by author name (partial match)  
- `available` - Filter available books (`true`/`false`)

**Response:**
```json
{
  "books": [
    {
      "id": 1,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "978-0-06-112008-4",
      "genre": "Fiction",
      "publishedYear": 1960,
      "totalCopies": 5,
      "availableCopies": 3,
      "addedDate": "2025-10-12T21:00:00.000Z"
    }
  ],
  "total": 1
}
```

### Get Book by ID
```http
GET /api/books/:id
```

### Add New Book
```http
POST /api/books
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123-45678-9",
  "genre": "Fiction",
  "publishedYear": 2023,
  "totalCopies": 3
}
```

### Update Book
```http
PUT /api/books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "totalCopies": 5
}
```

### Delete Book
```http
DELETE /api/books/:id
```

## 👥 Members API

### Get All Members
```http
GET /api/members
```

**Query Parameters:**
- `status` - Filter by status (`active`/`inactive`)

### Get Member by ID
```http
GET /api/members/:id
```

**Response includes borrowing history:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "membershipDate": "2025-10-12T21:00:00.000Z",
  "status": "active",
  "borrowedBooks": [],
  "borrowingHistory": []
}
```

### Register New Member
```http
POST /api/members
Content-Type: application/json

{
  "name": "Member Name",
  "email": "member@example.com",
  "phone": "+1-234-567-8900"
}
```

### Update Member
```http
PUT /api/members/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "inactive"
}
```

### Delete Member
```http
DELETE /api/members/:id
```

## 📖 Borrowing API

### Borrow a Book
```http
POST /api/borrow
Content-Type: application/json

{
  "memberId": 1,
  "bookId": 1,
  "dueDate": "2025-10-26T21:00:00.000Z"  // Optional, defaults to 14 days
}
```

### Return a Book
```http
POST /api/return
Content-Type: application/json

{
  "memberId": 1,
  "bookId": 1
}
```

**Response includes fine calculation:**
```json
{
  "message": "Book returned successfully",
  "borrowingRecord": {
    "id": 1,
    "memberId": 1,
    "bookId": 1,
    "returnDate": "2025-10-12T21:00:00.000Z",
    "fine": 0
  },
  "fine": "No fine"
}
```

### Get Borrowing Records
```http
GET /api/borrowings
```

**Query Parameters:**
- `status` - Filter by status (`active`/`returned`)
- `memberId` - Filter by member ID
- `bookId` - Filter by book ID

### Get Overdue Books
```http
GET /api/overdue
```

**Response:**
```json
{
  "overdueBooks": [
    {
      "id": 1,
      "memberId": 1,
      "bookId": 1,
      "memberName": "John Doe",
      "bookTitle": "Book Title",
      "dueDate": "2025-10-10T21:00:00.000Z",
      "overdueDays": 2,
      "estimatedFine": 2
    }
  ],
  "total": 1
}
```

## 📊 Statistics API

### Get Library Statistics
```http
GET /api/stats
```

**Response:**
```json
{
  "library": {
    "totalBooks": 12,
    "availableBooks": 9,
    "borrowedBooks": 3,
    "uniqueTitles": 3
  },
  "members": {
    "total": 2,
    "active": 2,
    "inactive": 0
  },
  "borrowings": {
    "total": 5,
    "active": 3,
    "returned": 2,
    "overdue": 1
  }
}
```

### Health Check
```http
GET /health
```

## 🎯 Sample Data

The system comes pre-loaded with sample data for testing:

### Books
1. **To Kill a Mockingbird** by Harper Lee (Fiction, 1960)
2. **1984** by George Orwell (Dystopian Fiction, 1949)
3. **The Great Gatsby** by F. Scott Fitzgerald (Classic Literature, 1925)

### Members
1. **John Doe** - john@example.com
2. **Jane Smith** - jane@example.com

## 🧪 Testing Examples

### Using cURL

```bash
# Get all books
curl http://localhost:3001/api/books

# Get available books only
curl "http://localhost:3001/api/books?available=true"

# Search books by genre
curl "http://localhost:3001/api/books?genre=fiction"

# Add a new book
curl -X POST http://localhost:3001/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Catcher in the Rye",
    "author": "J.D. Salinger",
    "isbn": "978-0-316-76948-0",
    "genre": "Fiction",
    "publishedYear": 1951,
    "totalCopies": 2
  }'

# Register a new member
curl -X POST http://localhost:3001/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "+1-555-0789"
  }'

# Borrow a book (member 1 borrows book 1)
curl -X POST http://localhost:3001/api/borrow \
  -H "Content-Type: application/json" \
  -d '{
    "memberId": 1,
    "bookId": 1
  }'

# Check library statistics
curl http://localhost:3001/api/stats

# Get overdue books
curl http://localhost:3001/api/overdue
```

## 🛡️ Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- **400 Bad Request**: Invalid input data or business rule violations
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "error": "Error message describing the issue"
}
```

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode (development/production)

### Business Rules
- **Borrowing Period**: 14 days default
- **Fine Rate**: $1 per day for overdue books
- **Max Borrowing**: No limit per member (configurable)
- **Duplicate Prevention**: One copy per book per member

## 🚀 Production Deployment

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "library-app"

# Monitor
pm2 status
pm2 logs library-app
```

### Using Docker
```bash
# Build image
docker build -t library-app .

# Run container
docker run -p 3001:3001 library-app
```

## 👨‍💻 Author

**MuddyThunder1040**
- GitHub: [@MuddyThunder1040](https://github.com/MuddyThunder1040)

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- Node.js community for continuous innovation
- Open source contributors who make projects like this possible

---

**Happy Library Managing! 📚**