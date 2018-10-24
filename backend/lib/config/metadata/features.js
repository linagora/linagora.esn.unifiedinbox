module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  const schema = {
    type: 'object',
    properties: {
      foldersSharing: {
        type: 'boolean'
      }
    }
  };

  return {
    rights: {
      padmin: 'rw',
      admin: 'rw',
      user: 'r'
    },
    validator: createValidator(schema)
  };
};
