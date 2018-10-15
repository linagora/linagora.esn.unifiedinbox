module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      htmlSignature: {
        type: 'string',
        minLength: 0
      },
      textSignature: {
        type: 'string',
        minLength: 0
      }
    },
    required: ['htmlSignature']
  };

  return {
    rights: {
      admin: 'rw',
      user: 'rw'
    },
    validator: createValidator(schema)
  };
};
