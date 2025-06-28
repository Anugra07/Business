import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitGroupApplication = mutation({
  args: {
    resumeId: v.id("_storage"),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has a pending group application
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "group_application"),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingApplication) {
      throw new Error("You already have a pending group application");
    }

    const applicationId = await ctx.db.insert("applications", {
      applicantId: userId,
      type: "group_application",
      status: "pending",
      resumeId: args.resumeId,
      coverLetter: args.coverLetter,
      appliedAt: Date.now(),
    });

    // Create notification for admin
    await ctx.db.insert("notifications", {
      userId: userId, // This would be admin user ID in real implementation
      type: "application_update",
      title: "New Group Application",
      message: "A new group application has been submitted",
      isRead: false,
      relatedId: applicationId,
      createdAt: Date.now(),
    });

    return applicationId;
  },
});

export const submitWolfPackApplication = mutation({
  args: {
    teamId: v.id("teams"),
    resumeId: v.id("_storage"),
    coverLetter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if team exists and has spots available
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.currentMembers >= team.maxMembers) {
      throw new Error("Team is full");
    }

    // Check if user already applied to this team
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.neq(q.field("status"), "rejected")
        )
      )
      .first();

    if (existingApplication) {
      throw new Error("You have already applied to this team");
    }

    const applicationId = await ctx.db.insert("applications", {
      applicantId: userId,
      teamId: args.teamId,
      type: "wolf_pack",
      status: "pending",
      resumeId: args.resumeId,
      coverLetter: args.coverLetter,
      appliedAt: Date.now(),
    });

    return applicationId;
  },
});

export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
      .order("desc")
      .collect();

    // Get team details for wolf pack applications
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        if (app.teamId) {
          const team = await ctx.db.get(app.teamId);
          return { ...app, team };
        }
        return app;
      })
    );

    return applicationsWithDetails;
  },
});

export const getPendingGroupApplications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd check if user is admin
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_type", (q) => q.eq("type", "group_application"))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();

    // Get applicant profiles
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", app.applicantId))
          .unique();
        return { ...app, profile };
      })
    );

    return applicationsWithProfiles;
  },
});

export const reviewApplication = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(), // "approved", "rejected", "shortlisted"
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd check if user is admin
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      reviewedAt: Date.now(),
      reviewedBy: userId,
      reviewNotes: args.reviewNotes,
    });

    const application = await ctx.db.get(args.applicationId);
    if (application) {
      // Create notification for applicant
      await ctx.db.insert("notifications", {
        userId: application.applicantId,
        type: "application_update",
        title: "Application Update",
        message: `Your application has been ${args.status}`,
        isRead: false,
        relatedId: args.applicationId,
        createdAt: Date.now(),
      });
    }

    return args.applicationId;
  },
});
