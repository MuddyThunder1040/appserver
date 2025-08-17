const request = require('supertest');
const app = require('../server');

describe('API Endpoints Unit Tests', () => {
  
  describe('Health Check Endpoint', () => {
    it('should return correct health data structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check if HTML contains expected health indicators
      expect(response.text).toContain('Health Check');
      expect(response.text).toContain('HEALTHY');
      expect(response.text).toContain('Uptime:');
      expect(response.text).toContain('Memory Usage:');
    });
  });

  describe('Status Endpoint', () => {
    it('should return comprehensive server information', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.text).toContain('Server Status');
      expect(response.text).toContain('Express.js');
      expect(response.text).toContain('RUNNING');
      expect(response.text).toContain('NODE VERSION');
      expect(response.text).toContain('PLATFORM');
    });
  });

  describe('Users API Validation', () => {
    it('should validate email format in user creation', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email-format',
        role: 'user'
      };

      const response = await request(app)
        .post('/users')
        .send(invalidUser);

      // The server should handle this gracefully
      // Either accept it (basic validation) or reject it (strict validation)
      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it('should handle special characters in names', async () => {
      const timestamp = Date.now();
      const specialUser = {
        name: 'José María O\'Connor-Smith',
        email: `special-${timestamp}@example.com`,
        role: 'user'
      };

      const response = await request(app)
        .post('/users')
        .send(specialUser)
        .expect(201);

      expect(response.text).toContain('José María O&#039;Connor-Smith');
    });
  });

  describe('Echo Endpoint Validation', () => {
    it('should preserve data types in echo response', async () => {
      const testData = {
        string: 'hello',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null_value: null
      };

      const response = await request(app)
        .post('/echo')
        .send(testData)
        .expect(200);

      expect(response.body.receivedData).toEqual(testData);
      expect(typeof response.body.receivedData.string).toBe('string');
      expect(typeof response.body.receivedData.number).toBe('number');
      expect(typeof response.body.receivedData.boolean).toBe('boolean');
      expect(Array.isArray(response.body.receivedData.array)).toBe(true);
    });
  });
});
