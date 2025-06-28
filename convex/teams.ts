import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTeam = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.string(),
    maxMembers: v.number(),
    tags: v.array(v.string()),
    requirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      description: args.description,
      type: args.type,
      status: "forming",
      maxMembers: args.maxMembers,
      currentMembers: 1,
      createdBy: userId,
      createdAt: Date.now(),
      tags: args.tags,
      requirements: args.requirements,
    });

    // Add creator as team leader
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "leader",
      joinedAt: Date.now(),
    });

    return teamId;
  },
});

export const getTeamsByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .filter((q) => q.eq(q.field("status"), "forming"))
      .order("desc")
      .collect();

    // Get team members count and creator info
    const teamsWithDetails = await Promise.all(
      teams.map(async (team) => {
        const creator = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", team.createdBy))
          .unique();
        
        const members = await ctx.db
          .query("teamMembers")
          .withIndex("by_team", (q) => q.eq("teamId", team._id))
          .collect();

        return { ...team, creator, membersCount: members.length };
      })
    );

    return teamsWithDetails;
  },
});

export const getUserTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const teams = await Promise.all(
      memberships.map(async (membership) => {
        const team = await ctx.db.get(membership.teamId);
        return { ...team, role: membership.role };
      })
    );

    return teams.filter(Boolean);
  },
});

export const getTeamDetails = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const members = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", member.userId))
          .unique();
        return { ...member, profile };
      })
    );

    return { ...team, members: membersWithProfiles };
  },
});

export const joinTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");

    if (team.currentMembers >= team.maxMembers) {
      throw new Error("Team is full");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("teamMembers")
      .withIndex("by_team_and_user", (q) => 
        q.eq("teamId", args.teamId).eq("userId", userId)
      )
      .unique();

    if (existingMembership) {
      throw new Error("Already a member of this team");
    }

    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.teamId, {
      currentMembers: team.currentMembers + 1,
    });

    return args.teamId;
  },
});

export const formGroupsFromApplications = mutation({
  args: { applicationIds: v.array(v.id("applications")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd check if user is admin
    const applications = await Promise.all(
      args.applicationIds.map(id => ctx.db.get(id))
    );

    const validApplications = applications.filter(Boolean);
    
    // Group applications into teams of 4
    const teams = [];
    for (let i = 0; i < validApplications.length; i += 4) {
      const teamApplications = validApplications.slice(i, i + 4);
      
      if (teamApplications.length >= 2) { // Minimum 2 people for a team
        const teamId = await ctx.db.insert("teams", {
          name: `Group ${Math.floor(i / 4) + 1}`,
          description: "Auto-formed group from applications",
          type: "group_application",
          status: "active",
          maxMembers: 4,
          currentMembers: teamApplications.length,
          createdBy: userId,
          createdAt: Date.now(),
          formedAt: Date.now(),
          tags: [],
        });

        // Add members to team
        for (const app of teamApplications) {
          await ctx.db.insert("teamMembers", {
            teamId,
            userId: app!.applicantId,
            role: "member",
            joinedAt: Date.now(),
          });

          // Update application status
          await ctx.db.patch(app!._id, {
            status: "approved",
            reviewedAt: Date.now(),
            reviewedBy: userId,
          });

          // Notify user
          await ctx.db.insert("notifications", {
            userId: app!.applicantId,
            type: "team_formed",
            title: "Team Formed!",
            message: "You've been placed in a team. Check your dashboard!",
            isRead: false,
            relatedId: teamId,
            createdAt: Date.now(),
          });
        }

        teams.push(teamId);
      }
    }

    return teams;
  },
});
