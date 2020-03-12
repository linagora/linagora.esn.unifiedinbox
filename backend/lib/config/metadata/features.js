module.exports = dependencies => {
  const { createValidator } = dependencies('esn-config').validator.helper;

  const schema = {
    type: 'object',
    properties: {
      foldersSharing: {
        type: 'boolean'
      },
      identity: {
        type: 'object',
        properties: {
          allowMembersToManage: {
            type: 'boolean'
          },
          acceptDomainAliasesAsEmailSource: {
            type: 'boolean'
          }
        }
      }
    },
    required: [
      'foldersSharing',
      'identity'
    ]
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
