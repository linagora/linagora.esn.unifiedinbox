module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      isRequestingReadReceiptsByDefault: {
        type: 'boolean'
      }
    },
    required: ['isRequestingReadReceiptsByDefault']
  };

  return {
    rights: {
      user: 'rw'
    },
    validator: createValidator(schema)
  };
};
