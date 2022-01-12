// @ts-check

import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers';

describe('test session', () => {
  const testData = getTestData();
  let app;
  let knex;
  let user;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    await knex.migrate.latest();
    await prepareData(app);
    user = testData.users.existing1;
  });

  it('GET /session/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newSession'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('POST /session', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: user,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);
  });

  it('DELETE /session', async () => {
    const cookie = await signIn(app, user);
    const responseSignOut = await app.inject({
      method: 'DELETE',
      url: app.reverse('session'),
      // используем полученные ранее куки
      cookies: cookie,
    });

    expect(responseSignOut.statusCode).toBe(302);
  });

  afterAll(async () => {
    await knex.migrate.rollback();
    app.close();
  });
});
