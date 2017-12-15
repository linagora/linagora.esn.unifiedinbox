module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      textSignature: {
        type: 'string',
        minLength: 1
      }
    },
    required: ['textSignature']
  };

  return {
    rights: {
      admin: 'rw',
      user: 'rw'
    },
    validator: createValidator(schema)
  };
};
