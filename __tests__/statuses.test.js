import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers';

describe('test statuses CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();
  let status;
  let user;
  let cookie;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);
    status = await models.status.query().findById(1);
    user = testData.users.existing1;
    cookie = await signIn(app, user);
  });

  it('GET statuses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('new status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('edit status', async () => {
    const response = await app.inject({
      method: 'GET',
      cookies: cookie,
      url: app.reverse('editStatus', { id: status.id }),
    });
    expect(response.statusCode).toBe(200);
  });

  it('create status', async () => {
    const params = testData.status;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createStatus'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
    const newStatus = await models.status.query().findOne(params);
    expect(newStatus).toMatchObject(params);
  });

  it('update status', async () => {
    const newStatusData = {
      name: 'Сompleted',
    };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id: status.id }),
      payload: {
        data: newStatusData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updateStatusData = await models.status.query().findById(status.id);
    expect(updateStatusData).toMatchObject(newStatusData);
  });

  it('delete status', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: status.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const remoteStatus = await models.status.query().findById(1);
    expect(remoteStatus).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});