import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GroupApplications } from "./GroupApplications";
import { WolfPackProjects } from "./WolfPackProjects";
import { OpportunityMarketplace } from "./OpportunityMarketplace";
import { MyTeams } from "./MyTeams";
import { AdminPanel } from "./AdminPanel";
import { NotificationCenter } from "./NotificationCenter";

type Tab = "overview" | "group-apps" | "wolf-pack" | "marketplace" | "teams" | "admin";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const profile = useQuery(api.profiles.getCurrentProfile);
  const userTeams = useQuery(api.teams.getUserTeams);
  const userApplications = useQuery(api.applications.getUserApplications);
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  if (!profile) return null;

  const tabs = [
    { id: "overview" as Tab, label: "Overview", icon: "🏠" },
    { id: "group-apps" as Tab, label: "Group Applications", icon: "👥" },
    { id: "wolf-pack" as Tab, label: "Wolf Pack Projects", icon: "🐺" },
    { id: "marketplace" as Tab, label: "Opportunities", icon: "🚀" },
    { id: "teams" as Tab, label: "My Teams", icon: "⭐" },
    { id: "admin" as Tab, label: "Admin", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{profile.experience}</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === "admin" && unreadCount && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === "overview" && <Overview profile={profile} teams={userTeams} applications={userApplications} />}
          {activeTab === "group-apps" && <GroupApplications />}
          {activeTab === "wolf-pack" && <WolfPackProjects />}
          {activeTab === "marketplace" && <OpportunityMarketplace />}
          {activeTab === "teams" && <MyTeams />}
          {activeTab === "admin" && <AdminPanel />}
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
}

function Overview({ profile, teams, applications }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile.firstName}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your projects and teams.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900">{teams?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Skills</p>
              <p className="text-2xl font-bold text-gray-900">{profile.skills?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">🚀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Experience</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{profile.experience}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">👥</span>
              <h3 className="font-semibold text-gray-900">Apply for Group</h3>
              <p className="text-sm text-gray-600">Join a 4-person team</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🐺</span>
              <h3 className="font-semibold text-gray-900">Join Wolf Pack</h3>
              <p className="text-sm text-gray-600">Apply to existing projects</p>
            </div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
            <div className="text-center">
              <span className="text-3xl mb-2 block">🚀</span>
              <h3 className="font-semibold text-gray-900">Create Opportunity</h3>
              <p className="text-sm text-gray-600">Start a new project</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {applications?.slice(0, 3).map((app: any) => (
            <div key={app._id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Application {app.status} for {app.type.replace("_", " ")}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {(!applications || applications.length === 0) && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
