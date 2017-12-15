module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  return {
    validator: createValidator({ type: 'string', format: 'uri' })
  };
};
