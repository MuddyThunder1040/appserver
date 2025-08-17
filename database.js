const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, 'app.db');
    }

    // Initialize database connection and create tables
    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('📊 Connected to SQLite database');
                    this.createTables()
                        .then(() => {
                            this.seedInitialData()
                                .then(() => resolve())
                                .catch(reject);
                        })
                        .catch(reject);
                }
            });
        });
    }

    // Create tables if they don't exist
    async createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    role TEXT DEFAULT 'user',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createLogsTable = `
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    endpoint TEXT,
                    user_agent TEXT,
                    ip_address TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.serialize(() => {
                this.db.run(createUsersTable, (err) => {
                    if (err) {
                        console.error('Error creating users table:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ Users table ready');
                    }
                });

                this.db.run(createLogsTable, (err) => {
                    if (err) {
                        console.error('Error creating logs table:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ Logs table ready');
                        resolve();
                    }
                });
            });
        });
    }

    // Seed initial data
    async seedInitialData() {
        return new Promise((resolve, reject) => {
            // Check if users already exist
            this.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row.count === 0) {
                    console.log('🌱 Seeding initial user data...');
                    const initialUsers = [
                        { name: "John Doe", email: "john@example.com", role: "admin" },
                        { name: "Jane Smith", email: "jane@example.com", role: "user" },
                        { name: "Bob Johnson", email: "bob@example.com", role: "user" }
                    ];

                    const stmt = this.db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)");
                    
                    initialUsers.forEach(user => {
                        stmt.run([user.name, user.email, user.role]);
                    });
                    
                    stmt.finalize((err) => {
                        if (err) {
                            reject(err);
                        } else {
                            console.log('✅ Initial users seeded');
                            resolve();
                        }
                    });
                } else {
                    console.log('📋 Users table already populated');
                    resolve();
                }
            });
        });
    }

    // User operations
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM users ORDER BY created_at DESC", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createUser(name, email, role = 'user') {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)");
            stmt.run([name, email, role], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, name, email, role });
                }
            });
            stmt.finalize();
        });
    }

    async updateUser(id, name, email, role) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                UPDATE users 
                SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);
            stmt.run([name, email, role, id], function(err) {
                if (err) {
                    reject(err);
                } else if (this.changes === 0) {
                    resolve(null); // No user found
                } else {
                    resolve({ id, name, email, role });
                }
            });
            stmt.finalize();
        });
    }

    async deleteUser(id) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare("DELETE FROM users WHERE id = ?");
            stmt.run([id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
            stmt.finalize();
        });
    }

    // Logging operations
    async logActivity(level, message, endpoint = null, userAgent = null, ipAddress = null) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO logs (level, message, endpoint, user_agent, ip_address) 
                VALUES (?, ?, ?, ?, ?)
            `);
            stmt.run([level, message, endpoint, userAgent, ipAddress], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
            stmt.finalize();
        });
    }

    async getLogs(limit = 100) {
        return new Promise((resolve, reject) => {
            this.db.all(
                "SELECT * FROM logs ORDER BY created_at DESC LIMIT ?", 
                [limit], 
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // Database statistics
    async getStats() {
        return new Promise((resolve, reject) => {
            const queries = [
                "SELECT COUNT(*) as userCount FROM users",
                "SELECT COUNT(*) as logCount FROM logs",
                "SELECT COUNT(*) as adminCount FROM users WHERE role = 'admin'",
                "SELECT COUNT(*) as recentLogs FROM logs WHERE created_at > datetime('now', '-1 hour')"
            ];

            Promise.all(queries.map(query => {
                return new Promise((res, rej) => {
                    this.db.get(query, (err, row) => {
                        if (err) rej(err);
                        else res(row);
                    });
                });
            })).then(results => {
                resolve({
                    totalUsers: results[0].userCount,
                    totalLogs: results[1].logCount,
                    adminUsers: results[2].adminCount,
                    recentLogs: results[3].recentLogs
                });
            }).catch(reject);
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('📊 Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
