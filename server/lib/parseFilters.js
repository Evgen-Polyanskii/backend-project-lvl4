export default (query) => Object.keys(query)
  .reduce((acc, key) => {
    const queryValue = query[key];
    if (!queryValue || queryValue === 'null') return acc;
    return { ...acc, [key]: queryValue };
  }, {});
