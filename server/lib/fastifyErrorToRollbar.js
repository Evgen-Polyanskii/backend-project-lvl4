import fp from 'fastify-plugin';
import Rollbar from 'rollbar';

export default fp((app, options, next) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: "production",
    endpoint: "https://rollbar.com/m4x1morlov/all/items",
  });
  app.setErrorHandler((err, req, reply) => {
    try {
      rollbar.log(`Error: ${err}`, req, reply);
      reply.send(err);
    } catch (error) {
      reply.send(error);
    }
  });
  next();
}, {
  fastify: '^3.x.x',
  name: 'fastify-error-to-rollbar',
});
