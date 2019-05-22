module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    properties: {
      restore: {
        isEnabled: { type: 'boolean' }
      }
    }
  };

  return {
    validator: createValidator(schema)
  };
};
