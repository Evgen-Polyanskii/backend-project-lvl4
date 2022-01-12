import i18next from 'i18next';

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const tasks = await app.objection.models.task.query()
        .withGraphJoined('[status, creator, executor]');
      reply.render('tasks/index', { tasks });
      return reply;
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.authenticate }, async (req, reply) => {
      const currentUserId = req.user.id;
      const task = new app.objection.models.task();
      const [users, statuses] = await Promise.all([
        app.objection.models.user.query(),
        app.objection.models.status.query(),
      ]);
      reply.render('tasks/new', {
        task, users, statuses, currentUserId,
      });
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = req.params.id;
      const task = await app.objection.models.task.query().findById(taskId)
        .withGraphJoined('[status, creator, executor]');
      reply.render('tasks/view', { task });
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = req.params.id;
      const [task, users, statuses] = await Promise.all([
        app.objection.models.task.query().findById(taskId).withGraphJoined('[status, creator, executor]'),
        app.objection.models.user.query(),
        app.objection.models.status.query(),
      ]);
      reply.render('tasks/edit', { task, users, statuses });
      return reply;
    })
    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const task = await app.objection.models.task.fromJson(req.body.data);
        await app.objection.models.task.query().insert(task);
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.redirect(app.reverse('newTask'));
        return reply;
      }
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const taskId = req.params.id;
        const taskToUpdate = await app.objection.models.task.query().findById(taskId);
        await taskToUpdate.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.redirect(app.reverse('editTask', { id: req.params.id }));
        return reply;
      }
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = Number(req.params.id);
      const userId = req.user.id;
      try {
        const taskToDelete = await app.objection.models.task.query().findById(taskId);
        if (taskToDelete.creatorId !== userId) {
          req.flash('error', i18next.t('flash.tasks.accessDenied'));
        } else {
          await app.objection.models.task.query().deleteById(taskId);
          req.flash('info', i18next.t('flash.tasks.delete.success'));
        }
        reply.redirect(app.reverse('tasks'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }
    });
};
