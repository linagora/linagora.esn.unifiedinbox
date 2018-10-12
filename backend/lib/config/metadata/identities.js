module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      id: {
        type: 'string',
        minLength: 1
      },
      description: {
        type: 'string',
        minLength: 1
      },
      name: {
        type: 'string',
        minLength: 1
      },
      email: {
        type: 'string',
        format: 'email'
      },
      replyTo: {
        type: 'string',
        format: 'email'
      },
      textSignature: {
        type: 'string',
        minLength: 0
      },
      mobileSignature: {
        type: 'string',
        minLength: 0
      }
    },
    required: ['id', 'description', 'name', 'email', 'replyTo', 'textSignature']
  };

  return {
    rights: {
      admin: 'rw',
      user: 'rw'
    },
    validator: createValidator(schema)
  };
};
