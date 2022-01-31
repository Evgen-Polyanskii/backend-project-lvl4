import i18next from 'i18next';
import parseFilters from '../lib/parseFilters';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const filter = parseFilters(req.query);
      const currentUserId = req.user.id;

      const taskQuery = app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor, labels]')
        .modify('filterExecutorId', filter.executorId)
        .modify('filterLabels', filter.labels)
        .modify('filterStatusId', filter.statusId)
        .modify('filterCreatorId', filter.creatorId);

      const [tasks, users, statuses, labels] = await Promise.all([
        taskQuery,
        app.objection.models.user.query(),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
      ]);
      reply.render('tasks/index', {
        tasks, statuses, users, labels, currentUserId, filter,
      });
      return reply;
    })
    .get('/tasks/new', { name: 'tasks/new', preValidation: app.authenticate }, async (req, reply) => {
      const currentUserId = req.user.id;
      const task = new app.objection.models.task();
      const [users, statuses, labels] = await Promise.all([
        app.objection.models.user.query(),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
      ]);
      reply.render('tasks/new', {
        task, users, statuses, labels, currentUserId,
      });
      return reply;
    })
    .get('/tasks/:id', { name: 'tasks/view', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = req.params.id;
      const task = await app.objection.models.task.query().findById(taskId)
        .withGraphJoined('[status, creator, executor, labels]');
      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'tasks/edit', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = req.params.id;
      const [task, users, statuses, labels] = await Promise.all([
        app.objection.models.task.query().findById(taskId).withGraphJoined('[status, creator, executor, labels]'),
        app.objection.models.user.query(),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
      ]);
      reply.render('tasks/edit', {
        task, users, statuses, labels,
      });
      return reply;
    })
    .post('/tasks', { name: 'tasks/create', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const task = await app.objection.models.task.fromJson(req.body.data);
        const { labels, ...taskData } = task;
        const labelIds = labels || [];
        await app.objection.models.task.transaction(async (trx) => {
          const taskLabels = await app.objection.models.label.query(trx).findByIds(labelIds);
          await app.objection.models.task.query(trx).allowGraph('labels').insertGraph([{
            ...taskData, labels: taskLabels,
          }], { relate: true });
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.redirect(app.reverse('tasks/new'));
        return reply;
      }
    })
    .patch('/tasks/:id', { name: 'tasks/update', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const taskId = Number(req.params.id);
        const { labels, ...taskData } = await app.objection.models.task.fromJson(req.body.data);
        const newData = { ...taskData, id: taskId };
        const labelIds = labels || [];
        await app.objection.models.task.transaction(async (trx) => {
          const taskLabels = await app.objection.models.label.query(trx).findByIds(labelIds);
          await app.objection.models.task.query(trx)
            .upsertGraph({ ...newData, labels: taskLabels }, { relate: true, unrelate: true, noUpdate: ['labels'] });
        });
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.redirect(app.reverse('tasks/edit', { id: req.params.id }));
        return reply;
      }
    })
    .delete('/tasks/:id', { name: 'tasks/delete', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = Number(req.params.id);
      const userId = req.user.id;
      try {
        const taskToDelete = await app.objection.models.task.query().findById(taskId);
        if (taskToDelete.creatorId !== userId) {
          req.flash('error', i18next.t('flash.tasks.accessDenied'));
        } else {
          await app.objection.models.task.transaction(async (trx) => {
            const task = await app.objection.models.task.query(trx).findById(taskId);
            await task.$relatedQuery('labels', trx).unrelate().where({ taskId });
            await task.$query(trx).delete();
          });
          req.flash('alert', i18next.t('flash.tasks.delete.success'));
        }
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
