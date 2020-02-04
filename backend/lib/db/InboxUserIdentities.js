const emailAddresses = require('email-addresses');

module.exports = dependencies => {
  const mongoose = dependencies('db').mongo.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const IdentitySchema = new Schema({
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
  });

  const InboxUserIdentitiesSchema = new Schema({
    _id: {
      type: ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    identities: [IdentitySchema]
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
