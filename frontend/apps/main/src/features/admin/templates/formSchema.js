import * as z from 'zod'

export const createFormSchema = (t) =>
  z.object({
    name: z.string({
      required_error: t('globals.messages.required')
    }),
    body: z.string({
      required_error: t('globals.messages.required')
    }),
    type: z.literal('email_outgoing').optional(),
    subject: z.string().optional(),
    is_default: z.boolean().optional().default(false)
  })
