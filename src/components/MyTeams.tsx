import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TeamChat } from "./TeamChat";

export function MyTeams() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "tasks">("overview");

  const userTeams = useQuery(api.teams.getUserTeams);
  const teamDetails = useQuery(api.teams.getTeamDetails, 
    selectedTeam ? { teamId: selectedTeam as any } : "skip"
  );
  const teamTasks = useQuery(api.tasks.getTeamTasks,
    selectedTeam ? { teamId: selectedTeam as any } : "skip"
  );

  if (!userTeams || userTeams.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <span className="text-6xl mb-4 block">⭐</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600 mb-4">You haven't joined any teams yet. Apply for group formation or join a wolf pack project!</p>
          <div className="flex justify-center space-x-4">
            <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors">
              Apply for Group
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
              Browse Wolf Packs
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentTeam = teamDetails;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Teams</h1>

      <div className="flex space-x-6">
        {/* Teams Sidebar */}
        <div className="w-80 bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold mb-4">Your Teams</h2>
          <div className="space-y-2">
            {userTeams.map((team) => (
              <button
                key={team._id}
                onClick={() => setSelectedTeam(team._id || null)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTeam === team._id
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="font-medium">{team.name}</div>
                <div className={`text-sm ${
                  selectedTeam === team._id ? "text-white/80" : "text-gray-600"
                }`}>
                  {team.role} • {team.type?.replace("_", " ") || "Unknown"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team Details */}
        <div className="flex-1">
          {!selectedTeam ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Team</h3>
              <p className="text-gray-600">Choose a team from the sidebar to view details</p>
            </div>
          ) : currentTeam ? (
            <div className="space-y-6">
              {/* Team Header */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{currentTeam.name}</h2>
                    <p className="text-gray-600">{currentTeam.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentTeam.status === "active" ? "bg-green-100 text-green-800" :
                    currentTeam.status === "forming" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {currentTeam.status}
                  </span>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-4 border-b">
                  {["overview", "chat", "tasks"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-2 px-1 border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Team Members */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentTeam.members?.map((member: any) => (
                        <div key={member._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                            {member.profile?.firstName?.[0]}{member.profile?.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">
                              {member.profile?.firstName} {member.profile?.lastName}
                            </div>
                            <div className="text-sm text-gray-600 capitalize">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-2xl">👥</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Members</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {currentTeam.currentMembers}/{currentTeam.maxMembers}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <span className="text-2xl">📅</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Created</p>
                          <p className="text-lg font-bold text-gray-900">
                            {new Date(currentTeam.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <span className="text-2xl">📝</span>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Tasks</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {teamTasks?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <TeamChat teamId={selectedTeam} />
              )}

              {activeTab === "tasks" && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Team Tasks</h3>
                  
                  {!teamTasks || teamTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">📝</span>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Yet</h4>
                      <p className="text-gray-600">Tasks will appear here when assigned by admin</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamTasks.map((task) => (
                        <div key={task._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              task.status === "assigned" ? "bg-blue-100 text-blue-800" :
                              task.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                              task.status === "completed" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded ${
                              task.priority === "high" ? "bg-red-100 text-red-800" :
                              task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {task.priority} priority
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading team details...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
