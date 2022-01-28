import { beforeEach } from '@jest/globals';
import getApp from '../server/index.js';
import {
  getLabel,
  getStatus,
  getUser,
  getTasks,
} from '../__fixtures__/entitiesData.js';
import signIn from './helpers';

let app;
let Model;
let cookies = {};

const tests = [
  {
    routesName: 'labels',
    modelName: 'label',
    findKey: 'name',
    editKey: ['name'],
    fakeData: getLabel(),
  },
  {
    routesName: 'statuses',
    modelName: 'status',
    findKey: 'name',
    editKey: ['name'],
    fakeData: getStatus(),
  },
  {
    routesName: 'tasks',
    modelName: 'task',
    findKey: 'name',
    editKey: ['name', 'description'],
    fakeData: getTasks(),
  },
].map((entity) => ({
  ...entity,
  toString: () => entity.routesName,
}));

beforeAll(async () => {
  app = await getApp();
});

describe.each(tests)('CRUD %s', (entity) => {
  beforeEach(async () => {
    Model = app.objection.models[entity.modelName];
    await app.objection.knex.migrate.latest();
    const user = getUser();

    await app.objection.models.user.query().insert(user);

    cookies = await signIn(app, user);
  });

  afterEach(async () => {
    await app.objection.knex.migrate.rollback();
  });

  it(`GET ${entity.routesName}`, async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse(entity.routesName),
      cookies,
    });

    expect(res.statusCode).toBe(200);
  });

  it(`GET new ${entity.routesName}`, async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse(`${entity.routesName}/new`),
      cookies,
    });
    expect(res.statusCode).toBe(200);
  });

  it(`Edit ${entity.routesName}`, async () => {
    const inserted = await Model.query().insert(entity.fakeData);

    const res = await app.inject({
      method: 'GET',
      url: app.reverse(`${entity.routesName}/edit`, { id: inserted.id }),
      cookies,
    });

    expect(res.statusCode).toBe(200);
  });

  it(`POST ${entity.routesName}`, async () => {
    const res = await app.inject({
      method: 'POST',
      url: app.reverse(`${entity.routesName}/create`),
      payload: { data: entity.fakeData },
      cookies,
    });

    const created = await Model.query().findOne({
      [entity.findKey]: entity.fakeData[entity.findKey],
    });

    expect(created).toMatchObject(entity.fakeData);
    expect(res.statusCode).toBe(302);
  });

  it(`PATCH ${entity.routesName}`, async () => {
    const inserted = await Model.query().insert(entity.fakeData);
    const updateData = entity.editKey.reduce((acc, key) => ({ ...acc, [key]: `${inserted[key]}_UPDATE` }), {});
    const res = await app.inject({
      method: 'PATCH',
      url: app.reverse(`${entity.routesName}/update`, { id: inserted.id }),
      payload: {
        data: { ...inserted, ...updateData },
      },
      cookies,
    });

    const update = await Model.query().findById(inserted.id);

    expect(res.statusCode).toBe(302);
    expect(update).toMatchObject(updateData);
  });

  it(`DELETE ${entity.routesName}`, async () => {
    const inserted = await Model.query().insert(entity.fakeData);

    const res = await app.inject({
      method: 'DELETE',
      url: app.reverse(`${entity.routesName}/delete`, { id: inserted.id }),
      cookies,
    });

    const deleted = await Model.query().findOne({
      [entity.findKey]: entity.fakeData[entity.findKey],
    });

    expect(res.statusCode).toBe(302);
    expect(deleted).toBeUndefined();
  });
});

describe('GET /tasks with params', () => {
  beforeEach(async () => {
    Model = app.objection.models.task;
    await app.objection.knex.migrate.latest();

    const user = getUser();
    await app.objection.models.user.query().insert(user);

    const task = getTasks();
    await Model.query().insert(task);

    cookies = await signIn(app, user);
  });

  afterEach(async () => {
    await app.objection.knex.migrate.rollback();
  });

  it('GET /tasks', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      query: {
        executorId: null,
        creatorId: null,
        statusId: 2,
        labels: null,
      },
      cookies,
    });

    expect(res.statusCode).toBe(200);

    const statusId = 2;
    const newTask = { ...getTasks(), statusId };
    await Model.query().insert(newTask);
    const numberOfTasks = await Model.query();

    expect(numberOfTasks).toHaveLength(2);

    const taskQuery = await Model.query()
      .withGraphJoined('[status, creator, executor, labels]')
      .modify('filterStatusId', statusId);

    expect(taskQuery).toHaveLength(1);
  });
});

afterAll(async () => {
  app.close();
});
