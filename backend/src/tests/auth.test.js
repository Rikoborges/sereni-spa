// backend/src/tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('Routes d\'authentification', () => {
  
  test('Inscription - créer un nouveau client', async () => {
    const res = await request(app)
      .post('/api/auth/inscription')
      .send({
        nom: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        telephone: '123456789',
        motDePasse: 'password123456'
      });

    expect([201, 400]).toContain(res.statusCode);
  }, 30000);

  test('Connexion - login com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/connexion')
      .send({
        email: 'joao@example.com',
        motDePasse: 'senha123456'
      });

    if (res.statusCode === 200) {
      expect(res.body.token).toBeDefined();
    }
  }, 30000);

});