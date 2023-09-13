import pusher from "$lib/server/pusher";
import { publicProcedure, t } from "$lib/server/trpc";
import { z } from 'zod';

export const router = t.router({
    sendMessage: publicProcedure.input(z.object({
        id: z.string(),
        message: z.string(),
        username: z.string(),
        sentAt: z.number()
    })).query(async ({ ctx, input }) => {
        pusher.trigger("chatpat-prototype", "new-message", {
            id: input.id,
            message: input.message,
            username: input.username,
            sentAt: input.sentAt
        })

        return {
            ...input
        }
    })
});

export type Router = typeof router;