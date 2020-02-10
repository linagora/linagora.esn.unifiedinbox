/**
  * @swagger
  *   ib_identities:
  *     description: Ok with a list of identities.
  *     schema:
  *       type: array
  *       items:
  *         $ref: "#/definitions/ib_identity"
  *     examples:
  *       application/json:
  *         [
  *           {
  *             "uuid": "596eb9bacdb52e34ea496920",
  *             "default": true,
  *             "name": "foo",
  *             "description": "Foo",
  *             "email": "foo@open-paas.org",
  *             "replyTo": "foo@open-paas.org",
  *             "htmlSignature": ""
  *           },
  *           {
  *             "id": "5968618344f5e527677f5d21",
  *             "default": false,
  *             "name": "bar",
  *             "description": "Bar",
  *             "email": "bar@open-paas.org",
  *             "replyTo": "bar@open-paas.org",
  *             "textSignature": ""
  *           }
  *         ]
**/
