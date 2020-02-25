module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;
  const schema = {
    type: 'array',
    minItems: 1,
    items: {
      type: 'object',
      additionalProperties: false,
      properties: {
        uuid: {
          type: 'string'
        },
        default: {
          type: 'boolean'
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
        htmlSignature: {
          type: 'string',
          minLength: 0
        },
        textSignature: {
          type: 'string',
          minLength: 0
        }
      },
      required: ['description', 'name', 'email']
    }
  };

  return {
    validateFormat
  };

  function validateFormat(identities) {
    return createValidator(schema)(identities) ||
      _checkDefaultIdentity(identities) ||
      _checkUuidUniqueness(identities);
  }

  function _checkDefaultIdentity(data) {
    if (data.filter(identity => identity.default).length !== 1) {
      return 'There must be 1 default identity';
    }

    return null;
  }

  function _checkUuidUniqueness(data) {
    const uuids = data.map(identity => identity.uuid).filter(Boolean);
    const uniqueUuids = [...new Set(uuids)];

    if (uuids.length !== uniqueUuids.length) {
      return 'Identity UUIDs must either unique or null';
    }

    return null;
  }
};
