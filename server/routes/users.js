// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      if (req.user.id !== Number(id)) {
        req.flash('error', i18next.t('flash.users.accessDenied'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
      const user = await app.objection.models.user.query().findById(id);
      reply.render('users/edit', { user });
      return reply;
    })
    .post('/users', async (req, reply) => {
      try {
        const user = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(user);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user: req.body.data, errors: data });
      }
      return reply;
    })
    .patch('/users/:id', { name: 'updateUserData' }, async (req, reply) => {
      try {
        const userToUpdate = await app.objection.models.user.query().findById(req.params.id);
        await userToUpdate.$query().patch(req.body.data);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        const user = await app.objection.models.user.query().findById(req.params.id);
        reply.render('users/edit', { user: { ...user, ...req.body.data }, errors: data });
        return reply;
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      try {
        const { id } = req.params;
        if (req.user.id !== Number(id)) {
          req.flash('error', i18next.t('flash.users.accessDenied'));
          reply.redirect(app.reverse('users'));
          return reply;
        }
        await app.objection.models.user.query().deleteById(id);
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
        return reply;
      } catch (err) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
        return reply;
      }
    });
};
