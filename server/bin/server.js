#! /usr/bin/env node

import getApp from '../index.js';

const port = process.env.PORT || 5000;

getApp().listen(port, '0.0.0.0', (err, address) => {
  if (err) {
    getApp().log.error(err);
    process.exit(1);
  }
  console.log(`Server is running on port: ${port}`);
});
