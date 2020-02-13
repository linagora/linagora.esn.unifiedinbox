const { expect } = require('chai');

describe('The InboxUserIdentities model', function() {
  let InboxUserIdentities, ObjectId, mongoose;

  beforeEach(function(done) {
    mongoose = this.moduleHelpers.dependencies('db').mongo.mongoose;
    ObjectId = mongoose.Types.ObjectId;

    require(`${this.testEnv.backendPath}/lib/db/InboxUserIdentities`)(this.moduleHelpers.dependencies);
    InboxUserIdentities = mongoose.model('InboxUserIdentities');

    this.connectMongoose(mongoose, done);
  });

  afterEach(function(done) {
    delete mongoose.connection.models.InboxUserIdentities;
    this.helpers.mongo.dropDatabase(err => {
      if (err) return done(err);
      this.testEnv.core.db.mongo.mongoose.connection.close(done);
    });
  });

  function saveDocument(identityJson, callback) {
    const identity = new InboxUserIdentities(identityJson);

    return identity.save(callback);
  }

  it('should not store a document if there is no default identity', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: []
    };

    saveDocument(identityJson, err => {
      expect(err.message).to.equal('User must have only 1 default identity');
      done();
    });
  });

  it('should not store a document if there is a identity without email', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo'
      }, {
        description: 'custom identity',
        name: 'bar'
      }]
    };

    saveDocument(identityJson, err => {
      expect(err.errors['identities.1.email'].message).to.equal('Path `email` is required.');
      done();
    });
  });

  it('should not store a document if there is a identity with the invalid email', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo'
      }, {
        email: 'invalidEmail',
        description: 'custom identity',
        name: 'bar'
      }]
    };

    saveDocument(identityJson, err => {
      expect(err.errors['identities.1.email'].message).to.equal('Invalid email address');
      done();
    });
  });

  it('should not store a document if there is a identity with the invalid reply to email', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo'
      }, {
        email: 'custom@lng.org',
        description: 'custom identity',
        name: 'bar',
        replyTo: 'invalidEmail'
      }]
    };

    saveDocument(identityJson, err => {
      expect(err.errors['identities.1.replyTo'].message).to.equal('Invalid email address');
      done();
    });
  });

  it('should not store a document if there is a identity without name', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo'
      }, {
        email: 'custom@lng.org',
        description: 'custom identity',
        replyTo: 'custom@lng.org'
      }]
    };

    saveDocument(identityJson, err => {
      expect(err.errors['identities.1.name'].message).to.equal('Path `name` is required.');
      done();
    });
  });

  it('should not store a document if there is a identity without description', function(done) {
    const identityJson = {
      _id: new ObjectId(),
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo'
      }, {
        email: 'custom@lng.org',
        name: 'custom',
        replyTo: 'custom@lng.org'
      }]
    };

    saveDocument(identityJson, err => {
      expect(err.errors['identities.1.description'].message).to.equal('Path `description` is required.');
      done();
    });
  });

  it('should store a valid document', function(done) {
    const _id = new ObjectId();

    const identityJson = {
      _id,
      identities: [{
        default: true,
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo',
        uuid: 'dbd2e3da-8d87-4232-9831-25d5dd892cc6'
      }, {
        email: 'foo@lng.org',
        description: 'default identity',
        name: 'foo',
        uuid: '9b5144d4-af29-489b-b9b4-cb5d217e189f'
      }]
    };

    saveDocument(identityJson, (err, savedDocument) => {
      expect(err).to.not.exist;
      expect(savedDocument).to.shallowDeepEqual({
        _id,
        identities: [{
          default: identityJson.identities[0].default,
          email: identityJson.identities[0].email,
          description: identityJson.identities[0].description,
          name: identityJson.identities[0].name,
          uuid: identityJson.identities[0].uuid
        }, {
          default: false,
          email: identityJson.identities[1].email,
          description: identityJson.identities[1].description,
          name: identityJson.identities[1].name,
          uuid: identityJson.identities[1].uuid
        }]
      });

      done();
    });
  });
});
