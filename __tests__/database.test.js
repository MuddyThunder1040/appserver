const request = require('supertest');
const Database = require('../database');

describe('Database Integration Tests', () => {
  let testDb;

  beforeAll(async () => {
    // Create a test database instance
    testDb = new Database();
    await testDb.init();
  });

  afterAll(async () => {
    // Clean up test database
    testDb.close();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await new Promise((resolve, reject) => {
      testDb.db.run("DELETE FROM users WHERE email LIKE '%test%'", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('User Management', () => {
    it('should create a user in database', async () => {
      const user = await testDb.createUser('Database Test User', 'dbtest@example.com', 'user');
      
      expect(user).toHaveProperty('id');
      expect(user.name).toBe('Database Test User');
      expect(user.email).toBe('dbtest@example.com');
      expect(user.role).toBe('user');
    });

    it('should retrieve all users from database', async () => {
      await testDb.createUser('User 1', 'user1@test.com', 'user');
      await testDb.createUser('User 2', 'user2@test.com', 'admin');
      
      const users = await testDb.getAllUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
      
      const testUsers = users.filter(u => u.email.includes('@test.com'));
      expect(testUsers).toHaveLength(2);
    });

    it('should retrieve user by ID', async () => {
      const newUser = await testDb.createUser('ID Test User', 'idtest@example.com', 'user');
      const retrievedUser = await testDb.getUserById(newUser.id);
      
      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser.name).toBe('ID Test User');
      expect(retrievedUser.email).toBe('idtest@example.com');
    });

    it('should handle duplicate email constraint', async () => {
      await testDb.createUser('First User', 'duplicate@test.com', 'user');
      
      await expect(
        testDb.createUser('Second User', 'duplicate@test.com', 'admin')
      ).rejects.toThrow();
    });

    it('should update user information', async () => {
      const newUser = await testDb.createUser('Original Name', 'update@test.com', 'user');
      
      const updatedUser = await testDb.updateUser(
        newUser.id, 
        'Updated Name', 
        'updated@test.com', 
        'admin'
      );
      
      expect(updatedUser).toBeTruthy();
      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe('updated@test.com');
      expect(updatedUser.role).toBe('admin');
    });

    it('should delete user', async () => {
      const newUser = await testDb.createUser('Delete Me', 'delete@test.com', 'user');
      
      const deleted = await testDb.deleteUser(newUser.id);
      expect(deleted).toBe(true);
      
      const retrievedUser = await testDb.getUserById(newUser.id);
      expect(retrievedUser).toBeFalsy();
    });
  });

  describe('Activity Logging', () => {
    it('should log activity', async () => {
      await testDb.logActivity('INFO', 'Test log message', '/test', 'Test Agent', '127.0.0.1');
      
      // Small delay to ensure log is written
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const logs = await testDb.getLogs(10);
      const testLog = logs.find(log => log.message === 'Test log message');
      
      expect(testLog).toBeTruthy();
      expect(testLog.level).toBe('INFO');
      expect(testLog.endpoint).toBe('/test');
      expect(testLog.user_agent).toBe('Test Agent');
      expect(testLog.ip_address).toBe('127.0.0.1');
    });

    it('should retrieve logs with limit', async () => {
      // Create multiple log entries
      for (let i = 0; i < 5; i++) {
        await testDb.logActivity('INFO', `Test log ${i}`, '/test', 'Test Agent', '127.0.0.1');
      }
      
      const logs = await testDb.getLogs(3);
      expect(logs.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Database Statistics', () => {
    beforeEach(async () => {
      // Clean up before stats tests
      await new Promise((resolve, reject) => {
        testDb.db.run("DELETE FROM users WHERE email LIKE '%stats%'", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    it('should return accurate statistics', async () => {
      // Create test data
      await testDb.createUser('Stats User 1', 'stats1@test.com', 'user');
      await testDb.createUser('Stats Admin', 'stats2@test.com', 'admin');
      
      const stats = await testDb.getStats();
      
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('adminUsers');
      expect(stats).toHaveProperty('totalLogs');
      expect(stats).toHaveProperty('recentLogs');
      
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.adminUsers).toBe('number');
      expect(typeof stats.totalLogs).toBe('number');
      expect(typeof stats.recentLogs).toBe('number');
    });
  });
});
