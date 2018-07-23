module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  return {
    rights: {
      padmin: 'r',
      admin: 'rw',
      user: 'r'
    },
    validator: createValidator({ type: 'boolean' })
  };
};
