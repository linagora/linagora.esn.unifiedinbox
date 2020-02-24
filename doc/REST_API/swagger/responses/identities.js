/**
  * @swagger
  * response:
  *   ib_identities:
  *     description: Ok with a list of identities.
  *     schema:
  *       type: array
  *       items:
  *         $ref: "#/definitions/ib_identity_to_respond"
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
  *             "htmlSignature": "",
  *             "usable": true,
  *             "error": {}
  *           },
  *           {
  *             "id": "5968618344f5e527677f5d21",
  *             "default": false,
  *             "name": "bar",
  *             "description": "Bar",
  *             "email": "bar@open-paas.org",
  *             "replyTo": "foo@open-paas.org",
  *             "textSignature": "",
  *             "usable": false,
  *             "error": {
  *                "email": true
  *             }
  *           }
  *         ]
  *   ib_identity_valid_emails:
  *     description: Ok with a list of emails.
  *     schema:
  *       type: array
  *       items:
  *         $ref: "#/definitions/us_email"
  *     examples:
  *       application/json:
  *         ["foo@open-pas.org", "bar@open-paas.org"]
**/
