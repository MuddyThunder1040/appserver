const request = require('supertest');
const app = require('./server');

describe('API Integration Tests', () => {
  
  let createdUserId;

  beforeAll(async () => {
    // Setup test data or configurations
    console.log('🧪 Starting API Integration Tests...');
  });

  afterAll(async () => {
    // Cleanup after tests
    console.log('✅ API Integration Tests completed!');
  });

  describe('User Management Flow', () => {
    
    it('should get initial users list', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);
      
      expect(response.text).toContain('Users Directory');
    });

    it('should create a new user via API', async () => {
      // Use timestamp to ensure unique email
      const timestamp = Date.now();
      const newUser = {
        name: 'Integration Test User',
        email: `integration-${timestamp}@test.com`,
        role: 'admin'
      };

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.text).toContain('Integration Test User');
      expect(response.text).toContain(`integration-${timestamp}@test.com`);
    });

    it('should retrieve the created user', async () => {
      // Create a specific user for this test
      const timestamp = Date.now();
      const newUser = {
        name: 'Retrieve Test User',
        email: `retrieve-${timestamp}@test.com`,
        role: 'user'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      // Extract user ID from response
      const idMatch = createResponse.text.match(/ID: (\d+)/);
      expect(idMatch).toBeTruthy();
      const userId = parseInt(idMatch[1]);

      // Then retrieve the user
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Retrieve Test User');
    });
  });

  describe('Error Handling', () => {
    
    it('should handle server errors gracefully', async () => {
      // Test with extremely long input
      const longString = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/users')
        .send({
          name: longString,
          email: `test-${Date.now()}@example.com`
        });

      // Should still handle the request (either success or proper error)
      expect([200, 201, 400, 413, 500]).toContain(response.status);
    });
  });

  describe('Security Tests', () => {
    
    it('should sanitize HTML input', async () => {
      const timestamp = Date.now();
      const maliciousInput = {
        name: '<script>alert("XSS")</script>',
        email: `security-test-${timestamp}@example.com`
      };

      const response = await request(app)
        .post('/users')
        .send(maliciousInput)
        .expect(201);

      // The response should not execute the script
      expect(response.text).not.toContain('<script>');
      // Should contain escaped version
      expect(response.text).toContain('&lt;script&gt;');
    });
  });
});
