import getApp from '../server/index.js';
import { getTestData, prepareData, signIn } from './helpers';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  const testData = getTestData();
  let task;
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
    task = await models.task.query().findById(1);
    user = testData.users.existing2;
    cookie = await signIn(app, user);
  });

  it('GET tasks', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('new task', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('edit task', async () => {
    const response = await app.inject({
      method: 'GET',
      cookies: cookie,
      url: app.reverse('editTask', { id: task.id }),
    });
    expect(response.statusCode).toBe(200);
  });

  it('create task', async () => {
    const params = testData.task;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createTask'),
      payload: {
        data: params,
      },
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);
    const newTask = await models.task.query().findOne({ name: params.name });
    expect(newTask).toMatchObject(params);
  });

  it('update task', async () => {
    const newTaskData = {
      ...testData.task,
      description: 'New Task',
    };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: task.id }),
      payload: {
        data: newTaskData,
      },
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const updateTaskData = await models.task.query().findById(task.id);
    expect(updateTaskData).toMatchObject(newTaskData);
  });

  it('delete task', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: task.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const remoteTask = await models.task.query().findById(task.id);
    expect(remoteTask).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
