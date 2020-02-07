const express = require('express');

module.exports = dependencies => {
  const router = express.Router();
  const helperMW = dependencies('helperMW');
  const configurationMW = dependencies('configurationMW');
  const controller = require('./controller')(dependencies);
  const middleware = require('./middleware')(dependencies);

  /**
   * @swagger
   * /inbox/forwardings:
   *   get:
   *     tags:
   *       - Forwardings
   *     description: Get list forwarding emails of current user
   *     responses:
   *       200:
   *         $ref: "#/responses/fw_forwardings"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.get('/',
    middleware.canGet,
    controller.get
  );
  /**
   * @swagger
   * /inbox/forwardings/users/{uuid}:
   *   get:
   *     tags:
   *       - Forwardings
   *     description: Get list forwarding emails for a specific user
   *     parameters:
   *       - $ref: "#/parameters/fw_domain_id"
   *       - $ref: "#/parameters/fw_user_id"
   *     responses:
   *       200:
   *         $ref: "#/responses/fw_forwardings"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.get('/users/:uuid',
    middleware.canGetForTargetUser,
    controller.getOfTargetUser
  );

  /**
   * @swagger
   * /inbox/forwardings:
   *   put:
   *     tags:
   *       - Forwardings
   *     description: Create new forwarding email of current user
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.put('/',
    middleware.canCreate,
    middleware.validateForwarding,
    controller.create
  );

  /**
   * @swagger
   * /inbox/forwardings/users/{uuid}:
   *   put:
   *     tags:
   *       - Forwardings
   *     description: Create new forwarding email for a specific user
   *     parameters:
   *       - $ref: "#/parameters/fw_domain_id"
   *       - $ref: "#/parameters/fw_forwarding"
   *       - $ref: "#/parameters/fw_user_id"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.put('/users/:uuid',
    middleware.canCreateForTargetUser,
    middleware.validateForwarding,
    controller.createForTargetUser
  );

  /**
   * @swagger
   * /inbox/forwardings:
   *   delete:
   *     tags:
   *       - Forwardings
   *     description: Delete forwarding email of current user
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.delete('/',
    middleware.canDelete,
    middleware.validateForwarding,
    controller.remove
  );

  /**
   * @swagger
   * /inbox/forwardings/users/{uuid}:
   *   delete:
   *     tags:
   *       - Forwardings
   *     description: Delete forwarding email for a specific user
   *     parameters:
   *       - $ref: "#/parameters/fw_domain_id"
   *       - $ref: "#/parameters/fw_forwarding"
   *       - $ref: "#/parameters/fw_user_id"
   *     responses:
   *       204:
   *         $ref: "#/responses/cm_204"
   *       400:
   *         $ref: "#/responses/cm_400"
   *       401:
   *         $ref: "#/responses/cm_401"
   *       403:
   *         $ref: "#/responses/cm_403"
   */
  router.delete('/users/:uuid',
    middleware.canDeleteOfTargetUser,
    middleware.validateForwarding,
    controller.removeOfTargetUser
  );

  router.put('/configurations',
    helperMW.requireInQuery('scope'),
    configurationMW.qualifyScopeQueries,
    middleware.validateForwardingConfigurations,
    configurationMW.validateWriteBody,
    configurationMW.checkAuthorizedRole,
    configurationMW.checkWritePermission,
    controller.updateForwardingConfigurations
  );

  return router;
};
