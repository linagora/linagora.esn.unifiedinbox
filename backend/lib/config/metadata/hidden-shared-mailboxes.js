module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  return {
    rights: {
      user: 'rw'
    },
    validator: createValidator({ type: 'object' })
  };
};
