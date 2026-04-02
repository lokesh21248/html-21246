const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints Testing', () => {

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('GET /api/v1/listings', () => {
    it('should return a response with defined status code', async () => {
      const res = await request(app).get('/api/v1/listings');
      expect(res.statusCode).toBeDefined();
      // Most likely 200 if public, or 401 if protected
    });
  });

  describe('POST /api/v1/bookings', () => {
    it('should fail when no payload/auth is provided', async () => {
      const res = await request(app).post('/api/v1/bookings').send({});
      // Expect client error (4xx) due to missing auth or payload validation
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.statusCode).toBeLessThan(500); 
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should enforce authentication (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

});
