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
      required: ['description', 'name', 'email', 'replyTo']
    }
  };

  return {
    validateFormat,
    validateEmails
  };

  function validateEmails(userEmails, identities) {
    return _checkValidEmailField(userEmails, identities, 'email') ||
      _checkValidEmailField(userEmails, identities, 'replyTo');
  }

  function validateFormat(identities) {
    return createValidator(schema)(identities) ||
      _checkDefaultIdentity(identities) ||
      _checkUuidUniqueness(identities);
  }

  function _checkValidEmailField(validEmails, identities, fieldName) {
    const emails = [...new Set(identities.map(identity => identity[fieldName]))];
    const invalidEmails = emails.filter(email => !validEmails.includes(email));

    if (invalidEmails.length) {
      return `Invalid identity ${fieldName} addresses: ${invalidEmails.join(', ')}`;
    }

    return null;
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
