import { Router } from "express";

import { createConversationSchema, conversationIdSchema, updateConversationSchema } from "../modules/conversation/conversation.validatior.js";
import conversationController from "../modules/conversation/conversation.controller.js";

const router = Router();

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({ body: req.body, params: req.params, query: req.query });
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// TTS (text to speech)
router.post('/initialize', conversationController.initSessions);
// router.post('/', validate(createConversationSchema), conversationController.initSessions);
router.get('/', conversationController.getAll);
router.get('/:id', validate(conversationIdSchema), conversationController.getOne);
router.patch('/:id', validate(updateConversationSchema), conversationController.update);
router.delete('/:id', validate(conversationIdSchema), conversationController.delete);

export default router;
