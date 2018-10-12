module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      textSignature: {
        type: 'string',
        minLength: 0
      },
      mobileSignature: {
        type: 'string',
        minLength: 0
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
