import { type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import {
  ClerkUserSyncError,
  markSanbiUserAuthDeleted,
  syncSanbiUserFromClerkUser,
} from "@server/auth/clerkUserSync";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    event = await verifyWebhook(req);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated": {
        await syncSanbiUserFromClerkUser({
          database: db,
          clerkUser: event.data,
        });
        break;
      }
      case "user.deleted": {
        if (event.data.id) {
          await markSanbiUserAuthDeleted({
            database: db,
            userId: event.data.id,
          });
        } else {
          console.warn("Clerk user.deleted webhook missing user id", {
            eventType: event.type,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    if (error instanceof ClerkUserSyncError) {
      console.error("Clerk webhook user sync failed", {
        clerkUserId: event.data.id,
        code: error.code,
      });
      return new Response("Invalid Clerk user payload", { status: 422 });
    }

    console.error("Clerk webhook handler failed", error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
