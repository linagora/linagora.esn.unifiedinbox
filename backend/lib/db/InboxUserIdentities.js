const emailAddresses = require('email-addresses');
const uuidV4 = require('uuid/v4');

module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const IdentitySchema = new Schema({
    uuid: { type: String, default: uuidV4 },
    name: { type: String, required: true },
    default: { type: Boolean, default: false },
    description: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: [_validateEmail, 'Invalid email address']
    },
    replyTo: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [_validateEmail, 'Invalid email address']
    },
    htmlSignature: { type: String },
    textSignature: { type: String }
  }, { _id: false });

  const InboxUserIdentitiesSchema = new Schema({
    _id: {
      type: ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    identities: {
      type: [IdentitySchema],
      required: true
    }
  });

  InboxUserIdentitiesSchema.pre('validate', function(next) {
    const defaultIdentity = this.identities.filter(identity => identity.default);

    if (defaultIdentity.length !== 1) {
      return next(new Error('User must have only 1 default identity'));
    }

    next();
  });

  return mongoose.model('InboxUserIdentities', InboxUserIdentitiesSchema);

  function _validateEmail(email) {
    return emailAddresses.parseOneAddress(email) !== null;
  }
};
