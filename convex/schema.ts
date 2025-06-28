import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // User profiles with extended information
  profiles: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    bio: v.optional(v.string()),
    skills: v.array(v.string()),
    experience: v.string(), // "beginner", "intermediate", "advanced"
    linkedinUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    portfolioUrl: v.optional(v.string()),
    resumeId: v.optional(v.id("_storage")),
    isVerified: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Teams/Groups
  teams: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.string(), // "group_application", "wolf_pack", "startup"
    status: v.string(), // "forming", "active", "completed"
    maxMembers: v.number(),
    currentMembers: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    formedAt: v.optional(v.number()),
    tags: v.array(v.string()),
    requirements: v.optional(v.string()),
  }).index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_creator", ["createdBy"]),

  // Team memberships
  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.id("users"),
    role: v.string(), // "leader", "member", "pending"
    joinedAt: v.number(),
  }).index("by_team", ["teamId"])
    .index("by_user", ["userId"])
    .index("by_team_and_user", ["teamId", "userId"]),

  // Applications for teams
  applications: defineTable({
    applicantId: v.id("users"),
    teamId: v.optional(v.id("teams")), // null for group applications
    type: v.string(), // "group_application", "wolf_pack"
    status: v.string(), // "pending", "approved", "rejected", "shortlisted"
    resumeId: v.id("_storage"),
    coverLetter: v.optional(v.string()),
    appliedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    reviewNotes: v.optional(v.string()),
  }).index("by_applicant", ["applicantId"])
    .index("by_team", ["teamId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Projects/Opportunities
  projects: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(), // "startup", "learning", "freelance", "open_source"
    status: v.string(), // "open", "in_progress", "completed", "paused"
    createdBy: v.id("users"),
    teamId: v.optional(v.id("teams")),
    requiredSkills: v.array(v.string()),
    timeCommitment: v.string(), // "part_time", "full_time", "flexible"
    duration: v.optional(v.string()),
    compensation: v.optional(v.string()),
    spotsAvailable: v.number(),
    applicationDeadline: v.optional(v.number()),
    createdAt: v.number(),
    tags: v.array(v.string()),
  }).index("by_creator", ["createdBy"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // Weekly tasks assigned by admin
  tasks: defineTable({
    teamId: v.id("teams"),
    title: v.string(),
    description: v.string(),
    assignedBy: v.id("users"), // admin user
    dueDate: v.number(),
    status: v.string(), // "assigned", "in_progress", "completed", "overdue"
    priority: v.string(), // "low", "medium", "high"
    assignedAt: v.number(),
    completedAt: v.optional(v.number()),
    submissionNotes: v.optional(v.string()),
    week: v.number(), // week number for tracking
  }).index("by_team", ["teamId"])
    .index("by_status", ["status"])
    .index("by_week", ["week"]),

  // Chat messages for team communication
  messages: defineTable({
    teamId: v.id("teams"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.string(), // "text", "file", "system"
    fileId: v.optional(v.id("_storage")),
    sentAt: v.number(),
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
  }).index("by_team", ["teamId"])
    .index("by_sender", ["senderId"]),

  // Admin settings and configurations
  adminSettings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("users"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "application_update", "team_formed", "task_assigned", "message"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()), // ID of related entity
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
