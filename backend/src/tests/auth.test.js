// backend/src/tests/auth.test.js
const request = require('supertest');
const app = require('../app');

// Nota: a conexão ao MongoDB é feita automaticamente pelo setup.js
// que usa MongoMemoryServer — base de dados em memória para testes

describe('Routes d\'authentification', () => {

  const emailTeste = `test${Date.now()}@example.com`;
  const motDePasse = 'password123456';

  // ─── INSCRIPTION ─────────────────────────────────────────

  test('Inscription — crée un nouveau client (201)', async () => {
    const res = await request(app)
      .post('/api/auth/inscription')
      .send({
        nom: 'Test User',
        email: emailTeste,
        telephone: '0612345678',
        motDePasse
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.nom).toBe('Test User');
  }, 30000);

  test('Inscription — email déjà utilisé (400)', async () => {
    const res = await request(app)
      .post('/api/auth/inscription')
      .send({
        nom: 'Test User',
        email: emailTeste,
        telephone: '0612345678',
        motDePasse
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.erreur).toBeDefined();
  }, 30000);

  test('Inscription — champs manquants (400 ou 500)', async () => {
    const res = await request(app)
      .post('/api/auth/inscription')
      .send({ email: 'incomplet@test.com' });

    expect([400, 500]).toContain(res.statusCode);
  }, 30000);

  // ─── CONNEXION ───────────────────────────────────────────

  test('Connexion — identifiants corrects (200)', async () => {
    const res = await request(app)
      .post('/api/auth/connexion')
      .send({ email: emailTeste, motDePasse });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.nom).toBeDefined();
  }, 30000);

  test('Connexion — mauvais mot de passe (401)', async () => {
    const res = await request(app)
      .post('/api/auth/connexion')
      .send({ email: emailTeste, motDePasse: 'mauvais_mdp' });

    expect(res.statusCode).toBe(401);
    expect(res.body.erreur).toBeDefined();
  }, 30000);

  test('Connexion — email inexistant (401)', async () => {
    const res = await request(app)
      .post('/api/auth/connexion')
      .send({ email: 'inexistant@example.com', motDePasse: '123456' });

    expect(res.statusCode).toBe(401);
  }, 30000);

});