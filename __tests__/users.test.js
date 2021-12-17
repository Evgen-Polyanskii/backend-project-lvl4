// @ts-check

import _ from 'lodash';
import getApp from '../server/index.js';
import encrypt from '../server/lib/secure.js';
import { getTestData, prepareData, signIn } from './helpers';

describe('test users CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();
  let user;
  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
    await knex.migrate.latest();
    await prepareData(app);
    user = testData.users.existing;
    cookie = await signIn(app, user);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const newUser = await models.user.query().findOne({ email: params.email });
    expect(newUser).toMatchObject(expected);
  });

  it('edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: user.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('update', async () => {
    const newUserData = {
      firstName: 'Alex',
      lastName: 'Alexov',
    };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUserData', { id: user.id }),
      payload: {
        data: newUserData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updateUserData = await models.user.query().findOne({ id: user.id });
    expect(updateUserData).toMatchObject(newUserData);
  });

  it('delete', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('updateUserData', { id: user.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const remoteUser = await models.user.query().findOne({ email: user.id });
    expect(remoteUser).toBeUndefined();
  });

  afterEach(async () => {
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
