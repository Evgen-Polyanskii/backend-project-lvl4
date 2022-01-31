import i18next from 'i18next';

const resource = '/statuses';

export default (app) => {
  app
    .get(resource, { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get(`${resource}/new`, { name: 'statuses/new', preValidation: app.authenticate }, (req, reply) => {
      const status = new app.objection.models.status();
      reply.render('statuses/new', { status });
    })
    .get(`${resource}/:id/edit`, { name: 'statuses/edit', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const status = await app.objection.models.status.query().findById(id);
      reply.render('statuses/edit', { status });
      return reply;
    })
    .post(resource, { name: 'statuses/create', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const status = await app.objection.models.status.fromJson(req.body.data);
        await app.objection.models.status.query().insert(status);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status: req.body.data, errors: data });
        return reply;
      }
    })
    .patch(`${resource}/:id`, { name: 'statuses/update', preValidation: app.authenticate }, async (req, reply) => {
      let statusToUpdate;
      try {
        statusToUpdate = await app.objection.models.status.query().findById(req.params.id);
        await statusToUpdate.$query().update(req.body.data);
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status: { ...statusToUpdate, ...req.body.data }, errors: data });
        return reply;
      }
    })
    .delete(`${resource}/:id`, { name: 'statuses/delete', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const { id } = req.params;
        const status = await app.objection.models.status.query().findById(id);
        const taskWithStatus = await status.$relatedQuery('tasks');
        if (taskWithStatus.length > 0) {
          req.flash('error', i18next.t('flash.statuses.delete.error'));
        } else {
          await status.$query().delete();
          req.flash('info', i18next.t('flash.statuses.delete.success'));
        }
        reply.redirect(app.reverse('statuses'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.redirect(app.reverse('statuses'));
        return reply;
      }
    });
};
