const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const { getIdentities, updateIdentities, getValidEmails } = require('./controller')(dependencies);
  const { canGet, canUpdate, validateIdentities } = require('./middleware')(dependencies);
  const { loadTargetUser } = dependencies('usersMW');
  const { checkIdInParams } = dependencies('helperMW');

  /**
   * @swagger
   * /unifiedinbox/api/inbox/users/{uuid}/identities:
   *   get:
   *     tags:
   *       - Identity
   *     description: Get identities belong to a specific user.
   *     responses:
   *       200:
   *         $ref: "#/responses/ib_identities"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/:uuid/identities',
    checkIdInParams('uuid', 'User'),
    loadTargetUser,
    canGet,
    getIdentities
  );

  /**
   * @swagger
   * /unifiedinbox/api/inbox/users/{uuid}/identities:
   *   put:
   *     tags:
   *       - Identity
   *     description: Save a list of identities for a specific user.
   *     parameters:
   *       - $ref: "#/parameters/uss_uuid"
   *       - $ref: "#/parameters/ib_identities"
   *     responses:
   *       200:
   *         $ref: "#/responses/ib_identities"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.put('/:uuid/identities',
    checkIdInParams('uuid', 'User'),
    loadTargetUser,
    validateIdentities,
    canUpdate,
    updateIdentities
  );

    /**
   * @swagger
   * /unifiedinbox/api/inbox/users/{uuid}/identities/validEmails:
   *   get:
   *     tags:
   *       - Identity
   *     description: Get a list of valid emails for identities of a specific user.
   *     parameters:
   *       - $ref: "#/parameters/uss_uuid"
   *     responses:
   *       200:
   *         $ref: "#/responses/ib_identity_valid_emails"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       404:
   *         $ref: "#/responses/cm_404"
   *       500:
   *         $ref: "#/responses/cm_500"
   */
  router.get('/:uuid/identities/validEmails',
    checkIdInParams('uuid', 'User'),
    loadTargetUser,
    getValidEmails
  );

  return router;
};
