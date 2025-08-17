const request = require('supertest');
const app = require('./server');

describe('Express Server API Tests', () => {
  
  // Test the root endpoint
  describe('GET /', () => {
    it('should return HTML homepage', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.text).toContain('Express Server API');
      expect(response.text).toContain('Welcome to the Express.js API Server!');
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  // Test health check endpoint
  describe('GET /health', () => {
    it('should return health status with HTML', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.text).toContain('Health Check');
      expect(response.text).toContain('Server is HEALTHY');
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  // Test API info endpoint
  describe('GET /api', () => {
    it('should return API information as JSON', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('message', 'Express API Server');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body.endpoints).toBeInstanceOf(Array);
      expect(response.body.endpoints.length).toBeGreaterThan(0);
    });
  });

  // Test users endpoints
  describe('Users API', () => {
    
    describe('GET /users', () => {
      it('should return users list as HTML', async () => {
        const response = await request(app)
          .get('/users')
          .expect(200);
        
        expect(response.text).toContain('Users Directory');
        expect(response.text).toContain('Total Users:');
        expect(response.text).toContain('John Doe');
        expect(response.text).toContain('Jane Smith');
        expect(response.headers['content-type']).toMatch(/html/);
      });
    });

    describe('GET /users/:id', () => {
      it('should return specific user data for valid ID', async () => {
        const response = await request(app)
          .get('/users/1')
          .expect(200)
          .expect('Content-Type', /json/);
        
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id', 1);
        expect(response.body.data).toHaveProperty('name', 'John Doe');
        expect(response.body.data).toHaveProperty('email', 'john@example.com');
      });

      it('should return 404 for invalid user ID', async () => {
        const response = await request(app)
          .get('/users/999')
          .expect(404)
          .expect('Content-Type', /json/);
        
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'User not found');
      });
    });

    describe('POST /users', () => {
        it('should create a new user with valid data', async () => {
          const timestamp = Date.now();
          const newUser = {
            name: 'Test User',
            email: `test-${timestamp}@example.com`
          };
          
          const response = await request(app)
            .post('/users')
            .send(newUser)
            .expect(201);
          
          expect(response.text).toContain('User Created Successfully!');
          expect(response.text).toContain('Test User');
        });      it('should return 400 for missing required fields', async () => {
        const invalidUser = {
          name: 'Test User'
          // missing email
        };

        const response = await request(app)
          .post('/users')
          .send(invalidUser)
          .expect(400)
          .expect('Content-Type', /json/);
        
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message', 'Name and email are required');
      });
    });
  });

  // Test users form endpoint
  describe('GET /users-form', () => {
    it('should return user creation form', async () => {
      const response = await request(app)
        .get('/users-form')
        .expect(200);
      
      expect(response.text).toContain('Create New User');
      expect(response.text).toContain('<form');
      expect(response.text).toContain('name="name"');
      expect(response.text).toContain('name="email"');
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  // Test status endpoint
  describe('GET /status', () => {
    it('should return server status information', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);
      
      expect(response.text).toContain('Server Status');
      expect(response.text).toContain('RUNNING');
      expect(response.text).toContain('Express.js');
      expect(response.text).toContain('NODE VERSION');
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  // Test echo endpoint
  describe('POST /echo', () => {
    it('should echo back the request data', async () => {
      const testData = {
        message: 'Hello World',
        number: 42,
        array: [1, 2, 3]
      };

      const response = await request(app)
        .post('/echo')
        .send(testData)
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('message', 'Echo response');
      expect(response.body).toHaveProperty('receivedData');
      expect(response.body.receivedData).toEqual(testData);
      expect(response.body).toHaveProperty('method', 'POST');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  // Test 404 handler
  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
      expect(response.body).toHaveProperty('requestedPath', '/non-existent-route');
      expect(response.body).toHaveProperty('method', 'GET');
      expect(response.body).toHaveProperty('availableEndpoints');
      expect(response.body.availableEndpoints).toBeInstanceOf(Array);
    });

    it('should return 404 for POST to non-existent routes', async () => {
      const response = await request(app)
        .post('/invalid-endpoint')
        .send({ test: 'data' })
        .expect(404)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('method', 'POST');
      expect(response.body).toHaveProperty('requestedPath', '/invalid-endpoint');
    });
  });

  // Performance and integration tests
  describe('Performance Tests', () => {
    it('should respond to health check within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () => 
        request(app).get('/api').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('message', 'Express API Server');
      });
    });
  });

  // Data validation tests
  describe('Data Validation', () => {
    it('should handle empty POST request body', async () => {
      const response = await request(app)
        .post('/users')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/echo')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});

// Additional utility tests
describe('Server Utilities', () => {
  
  describe('Content Types', () => {
    it('should serve HTML for web pages', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should serve JSON for API endpoints', async () => {
      const response = await request(app).get('/api');
      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle GET requests', async () => {
      await request(app).get('/health').expect(200);
    });

    it('should handle POST requests', async () => {
      await request(app)
        .post('/echo')
        .send({ test: 'data' })
        .expect(200);
    });
  });
});
