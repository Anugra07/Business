import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const assignTask = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    description: v.string(),
    dueDate: v.number(),
    priority: v.string(),
    week: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd check if user is admin
    const taskId = await ctx.db.insert("tasks", {
      teamId: args.teamId,
      title: args.title,
      description: args.description,
      assignedBy: userId,
      dueDate: args.dueDate,
      status: "assigned",
      priority: args.priority,
      assignedAt: Date.now(),
      week: args.week,
    });

    // Notify team members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.insert("notifications", {
        userId: member.userId,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `Your team has been assigned: ${args.title}`,
        isRead: false,
        relatedId: taskId,
        createdAt: Date.now(),
      });
    }

    return taskId;
  },
});

export const getTeamTasks = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();

    return tasks;
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
    submissionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Check if user is a member of the team
    const membership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", task.teamId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not authorized to update this task");
    }

    const updates: any = { status: args.status };
    if (args.submissionNotes) {
      updates.submissionNotes = args.submissionNotes;
    }
    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.taskId, updates);

    return args.taskId;
  },
});

export const getAllTasks = query({
  args: { week: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd check if user is admin
    let tasks;
    
    if (args.week) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_week", (q) => q.eq("week", args.week!))
        .order("desc")
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").order("desc").collect();
    }

    // Get team details for each task
    const tasksWithTeams = await Promise.all(
      tasks.map(async (task) => {
        const team = await ctx.db.get(task.teamId);
        return { ...task, team };
      })
    );

    return tasksWithTeams;
  },
});
