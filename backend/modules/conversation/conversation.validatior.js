import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().max(100).optional(),
    metadata: z.record(z.any()).optional(),
  })
});

export const updateConversationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(100),
  })
});

export const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid conversation ID'),
  })
});