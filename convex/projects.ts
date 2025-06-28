import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    requiredSkills: v.array(v.string()),
    timeCommitment: v.string(),
    duration: v.optional(v.string()),
    compensation: v.optional(v.string()),
    spotsAvailable: v.number(),
    applicationDeadline: v.optional(v.number()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      category: args.category,
      status: "open",
      createdBy: userId,
      requiredSkills: args.requiredSkills,
      timeCommitment: args.timeCommitment,
      duration: args.duration,
      compensation: args.compensation,
      spotsAvailable: args.spotsAvailable,
      applicationDeadline: args.applicationDeadline,
      createdAt: Date.now(),
      tags: args.tags,
    });

    return projectId;
  },
});

export const getProjects = query({
  args: { 
    category: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let projects;

    if (args.category) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    } else if (args.status) {
      projects = await ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      projects = await ctx.db.query("projects").order("desc").collect();
    }

    // Get creator profiles
    const projectsWithCreators = await Promise.all(
      projects.map(async (project) => {
        const creator = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", project.createdBy))
          .unique();
        return { ...project, creator };
      })
    );

    return projectsWithCreators;
  },
});

export const getProjectDetails = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const creator = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", project.createdBy))
      .unique();

    return { ...project, creator };
  },
});

export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .order("desc")
      .collect();

    return projects;
  },
});

export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    if (project.createdBy !== userId) {
      throw new Error("Not authorized to update this project");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
    });

    return args.projectId;
  },
});
