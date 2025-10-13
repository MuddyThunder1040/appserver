const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory data storage (in production, use a real database)
let books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    genre: "Fiction",
    publishedYear: 1960,
    totalCopies: 5,
    availableCopies: 3,
    addedDate: new Date().toISOString()
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    genre: "Dystopian Fiction",
    publishedYear: 1949,
    totalCopies: 3,
    availableCopies: 2,
    addedDate: new Date().toISOString()
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    genre: "Classic Literature",
    publishedYear: 1925,
    totalCopies: 4,
    availableCopies: 4,
    addedDate: new Date().toISOString()
  }
];

let members = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    membershipDate: new Date().toISOString(),
    status: "active",
    borrowedBooks: []
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-0456",
    membershipDate: new Date().toISOString(),
    status: "active",
    borrowedBooks: []
  }
];

let borrowingRecords = [];

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Library Management System!',
    timestamp: new Date().toISOString(),
    status: 'Server is running',
    endpoints: {
      books: '/api/books',
      members: '/api/members',
      borrowing: '/api/borrow',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    stats: {
      totalBooks: books.length,
      totalMembers: members.length,
      activeBorrowings: borrowingRecords.filter(r => !r.returnDate).length
    }
  });
});

// ========== BOOKS API ==========

// Get all books
app.get('/api/books', (req, res) => {
  const { genre, author, available } = req.query;
  let filteredBooks = books;

  if (genre) {
    filteredBooks = filteredBooks.filter(book => 
      book.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (available === 'true') {
    filteredBooks = filteredBooks.filter(book => book.availableCopies > 0);
  }

  res.json({
    books: filteredBooks,
    total: filteredBooks.length
  });
});

// Get book by ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

// Add new book
app.post('/api/books', (req, res) => {
  const { title, author, isbn, genre, publishedYear, totalCopies } = req.body;
  
  if (!title || !author || !isbn) {
    return res.status(400).json({
      error: 'Title, author, and ISBN are required'
    });
  }

  // Check if book with same ISBN already exists
  const existingBook = books.find(b => b.isbn === isbn);
  if (existingBook) {
    return res.status(400).json({
      error: 'Book with this ISBN already exists'
    });
  }

  const newBook = {
    id: books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1,
    title,
    author,
    isbn,
    genre: genre || 'General',
    publishedYear: publishedYear || null,
    totalCopies: totalCopies || 1,
    availableCopies: totalCopies || 1,
    addedDate: new Date().toISOString()
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// Update book
app.put('/api/books/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const { title, author, genre, publishedYear, totalCopies } = req.body;
  const book = books[bookIndex];
  
  // Calculate new available copies if total copies changed
  const copiesDifference = (totalCopies || book.totalCopies) - book.totalCopies;
  
  books[bookIndex] = {
    ...book,
    title: title || book.title,
    author: author || book.author,
    genre: genre || book.genre,
    publishedYear: publishedYear || book.publishedYear,
    totalCopies: totalCopies || book.totalCopies,
    availableCopies: book.availableCopies + copiesDifference
  };

  res.json(books[bookIndex]);
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
  const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Check if book is currently borrowed
  const activeBorrowings = borrowingRecords.filter(r => 
    r.bookId === parseInt(req.params.id) && !r.returnDate
  );
  
  if (activeBorrowings.length > 0) {
    return res.status(400).json({
      error: 'Cannot delete book that is currently borrowed'
    });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];
  res.json({ message: 'Book deleted successfully', book: deletedBook });
});

// ========== MEMBERS API ==========

// Get all members
app.get('/api/members', (req, res) => {
  const { status } = req.query;
  let filteredMembers = members;

  if (status) {
    filteredMembers = filteredMembers.filter(member => member.status === status);
  }

  res.json({
    members: filteredMembers,
    total: filteredMembers.length
  });
});

// Get member by ID
app.get('/api/members/:id', (req, res) => {
  const member = members.find(m => m.id === parseInt(req.params.id));
  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // Get member's borrowing history
  const borrowingHistory = borrowingRecords.filter(r => r.memberId === member.id);
  
  res.json({
    ...member,
    borrowingHistory
  });
});

// Add new member
app.post('/api/members', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'Name and email are required'
    });
  }

  // Check if member with same email already exists
  const existingMember = members.find(m => m.email === email);
  if (existingMember) {
    return res.status(400).json({
      error: 'Member with this email already exists'
    });
  }

  const newMember = {
    id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
    name,
    email,
    phone: phone || null,
    membershipDate: new Date().toISOString(),
    status: 'active',
    borrowedBooks: []
  };

  members.push(newMember);
  res.status(201).json(newMember);
});

// Update member
app.put('/api/members/:id', (req, res) => {
  const memberIndex = members.findIndex(m => m.id === parseInt(req.params.id));
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  const { name, email, phone, status } = req.body;
  const member = members[memberIndex];

  members[memberIndex] = {
    ...member,
    name: name || member.name,
    email: email || member.email,
    phone: phone || member.phone,
    status: status || member.status
  };

  res.json(members[memberIndex]);
});

// Delete member
app.delete('/api/members/:id', (req, res) => {
  const memberIndex = members.findIndex(m => m.id === parseInt(req.params.id));
  if (memberIndex === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  // Check if member has active borrowings
  const activeBorrowings = borrowingRecords.filter(r => 
    r.memberId === parseInt(req.params.id) && !r.returnDate
  );
  
  if (activeBorrowings.length > 0) {
    return res.status(400).json({
      error: 'Cannot delete member with active borrowings'
    });
  }

  const deletedMember = members.splice(memberIndex, 1)[0];
  res.json({ message: 'Member deleted successfully', member: deletedMember });
});

// ========== BORROWING API ==========

// Borrow a book
app.post('/api/borrow', (req, res) => {
  const { memberId, bookId, dueDate } = req.body;
  
  if (!memberId || !bookId) {
    return res.status(400).json({
      error: 'Member ID and Book ID are required'
    });
  }

  const member = members.find(m => m.id === memberId);
  const book = books.find(b => b.id === bookId);

  if (!member) {
    return res.status(404).json({ error: 'Member not found' });
  }

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (member.status !== 'active') {
    return res.status(400).json({ error: 'Member account is not active' });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: 'No available copies of this book' });
  }

  // Check if member already has this book
  const existingBorrowing = borrowingRecords.find(r => 
    r.memberId === memberId && r.bookId === bookId && !r.returnDate
  );
  
  if (existingBorrowing) {
    return res.status(400).json({ error: 'Member already has this book borrowed' });
  }

  // Calculate due date (default 14 days from now)
  const calculatedDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const borrowingRecord = {
    id: borrowingRecords.length > 0 ? Math.max(...borrowingRecords.map(r => r.id)) + 1 : 1,
    memberId,
    bookId,
    memberName: member.name,
    bookTitle: book.title,
    borrowDate: new Date().toISOString(),
    dueDate: calculatedDueDate,
    returnDate: null,
    fine: 0
  };

  borrowingRecords.push(borrowingRecord);
  
  // Update book availability
  book.availableCopies -= 1;
  
  // Update member's borrowed books
  member.borrowedBooks.push({
    bookId,
    bookTitle: book.title,
    borrowDate: borrowingRecord.borrowDate,
    dueDate: calculatedDueDate
  });

  res.status(201).json(borrowingRecord);
});

// Return a book
app.post('/api/return', (req, res) => {
  const { memberId, bookId } = req.body;
  
  if (!memberId || !bookId) {
    return res.status(400).json({
      error: 'Member ID and Book ID are required'
    });
  }

  const borrowingIndex = borrowingRecords.findIndex(r => 
    r.memberId === memberId && r.bookId === bookId && !r.returnDate
  );

  if (borrowingIndex === -1) {
    return res.status(404).json({ error: 'No active borrowing record found' });
  }

  const borrowingRecord = borrowingRecords[borrowingIndex];
  const book = books.find(b => b.id === bookId);
  const member = members.find(m => m.id === memberId);

  // Calculate fine for overdue books
  const dueDate = new Date(borrowingRecord.dueDate);
  const returnDate = new Date();
  const overdueDays = Math.max(0, Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24)));
  const fine = overdueDays * 1; // $1 per day fine

  // Update borrowing record
  borrowingRecords[borrowingIndex] = {
    ...borrowingRecord,
    returnDate: returnDate.toISOString(),
    fine
  };

  // Update book availability
  book.availableCopies += 1;

  // Remove from member's borrowed books
  member.borrowedBooks = member.borrowedBooks.filter(b => b.bookId !== bookId);

  res.json({
    message: 'Book returned successfully',
    borrowingRecord: borrowingRecords[borrowingIndex],
    fine: fine > 0 ? `$${fine} fine for ${overdueDays} overdue days` : 'No fine'
  });
});

// Get all borrowing records
app.get('/api/borrowings', (req, res) => {
  const { status, memberId, bookId } = req.query;
  let filteredRecords = borrowingRecords;

  if (status === 'active') {
    filteredRecords = filteredRecords.filter(r => !r.returnDate);
  } else if (status === 'returned') {
    filteredRecords = filteredRecords.filter(r => r.returnDate);
  }

  if (memberId) {
    filteredRecords = filteredRecords.filter(r => r.memberId === parseInt(memberId));
  }

  if (bookId) {
    filteredRecords = filteredRecords.filter(r => r.bookId === parseInt(bookId));
  }

  res.json({
    borrowings: filteredRecords,
    total: filteredRecords.length
  });
});

// Get overdue books
app.get('/api/overdue', (req, res) => {
  const now = new Date();
  const overdueRecords = borrowingRecords.filter(r => {
    if (r.returnDate) return false; // Already returned
    return new Date(r.dueDate) < now;
  });

  const overdueWithDetails = overdueRecords.map(record => {
    const overdueDays = Math.ceil((now - new Date(record.dueDate)) / (1000 * 60 * 60 * 24));
    return {
      ...record,
      overdueDays,
      estimatedFine: overdueDays * 1
    };
  });

  res.json({
    overdueBooks: overdueWithDetails,
    total: overdueWithDetails.length
  });
});

// Get library statistics
app.get('/api/stats', (req, res) => {
  const totalBooks = books.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableBooks = books.reduce((sum, book) => sum + book.availableCopies, 0);
  const borrowedBooks = totalBooks - availableBooks;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const overdueBooks = borrowingRecords.filter(r => 
    !r.returnDate && new Date(r.dueDate) < new Date()
  ).length;

  res.json({
    library: {
      totalBooks,
      availableBooks,
      borrowedBooks,
      uniqueTitles: books.length
    },
    members: {
      total: members.length,
      active: activeMembers,
      inactive: members.length - activeMembers
    },
    borrowings: {
      total: borrowingRecords.length,
      active: borrowingRecords.filter(r => !r.returnDate).length,
      returned: borrowingRecords.filter(r => r.returnDate).length,
      overdue: overdueBooks
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api/users`);
});

module.exports = app;