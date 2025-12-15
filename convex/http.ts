import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payload = await request.json();

        // Clerk webhook for user.created and user.updated events
        if (payload.type === "user.created" || payload.type === "user.updated") {
            const user = payload.data;

            await ctx.runMutation(internal.users.upsertFromClerk, {
                clerkId: user.id,
                email: user.email_addresses[0]?.email_address,
                name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username,
                image: user.image_url,
            });
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;
