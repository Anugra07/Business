/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as http from "../http.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as projects from "../projects.js";
import type * as router from "../router.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  applications: typeof applications;
  auth: typeof auth;
  chat: typeof chat;
  http: typeof http;
  notifications: typeof notifications;
  profiles: typeof profiles;
  projects: typeof projects;
  router: typeof router;
  tasks: typeof tasks;
  teams: typeof teams;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
