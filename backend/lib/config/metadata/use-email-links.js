module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  return {
    rights: {
      admin: 'rw',
      user: 'rw'
    },
    validator: createValidator({ type: 'boolean' })
  };
};
