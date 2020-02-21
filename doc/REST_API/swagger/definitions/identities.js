/**
  * @swagger
  * definition:
  *   ib_identity_to_update:
  *     description: Identity object of a user
  *     type: object
  *     properties:
  *       uuid:
  *         type: string
  *       default:
  *         type: boolean
  *       name:
  *         type: string
  *       description:
  *         type: string
  *       email:
  *         type: string
  *       replyTo:
  *         type: string
  *       htmlSignature:
  *         type: string
  *       textSignature:
  *         type: string
  *   ib_identity_to_respond:
  *     description: Identity object of a user
  *     type: object
  *     properties:
  *       uuid:
  *         type: string
  *       default:
  *         type: boolean
  *       name:
  *         type: string
  *       description:
  *         type: string
  *       email:
  *         type: string
  *       replyTo:
  *         type: string
  *       htmlSignature:
  *         type: string
  *       textSignature:
  *         type: string
  *       usable:
  *         type: boolean
  *         description: To signal to indicate an identity is usable to send emails
  *       error:
  *         type: object
  *         description: If the identity is not usable, this error object contains the error fields
  */
