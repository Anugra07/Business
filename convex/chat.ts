import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: {
    teamId: v.id("teams"),
    content: v.string(),
    type: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is a member of the team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not authorized to send messages to this team");
    }

    const messageId = await ctx.db.insert("messages", {
      teamId: args.teamId,
      senderId: userId,
      content: args.content,
      type: args.type || "text",
      fileId: args.fileId,
      sentAt: Date.now(),
      isDeleted: false,
    });

    return messageId;
  },
});

export const getTeamMessages = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user is a member of the team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not authorized to view messages for this team");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("asc")
      .collect();

    // Get sender profiles
    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();
        
        let fileUrl = null;
        if (message.fileId) {
          fileUrl = await ctx.storage.getUrl(message.fileId);
        }

        return { ...message, sender, fileUrl };
      })
    );

    return messagesWithSenders;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
    });

    return args.messageId;
  },
});
