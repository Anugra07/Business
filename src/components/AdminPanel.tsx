import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"applications" | "teams" | "tasks">("applications");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  const pendingApplications = useQuery(api.applications.getPendingGroupApplications);
  const allTasks = useQuery(api.tasks.getAllTasks, {});
  const reviewApplication = useMutation(api.applications.reviewApplication);
  const formGroups = useMutation(api.teams.formGroupsFromApplications);

  const handleReviewApplication = async (applicationId: string, status: string) => {
    try {
      await reviewApplication({
        applicationId: applicationId as any,
        status,
      });
      toast.success(`Application ${status}`);
    } catch (error) {
      toast.error("Failed to review application");
      console.error(error);
    }
  };

  const handleFormGroups = async () => {
    if (selectedApplications.length < 2) {
      toast.error("Select at least 2 applications to form groups");
      return;
    }

    try {
      await formGroups({
        applicationIds: selectedApplications as any,
      });
      toast.success("Groups formed successfully!");
      setSelectedApplications([]);
    } catch (error) {
      toast.error("Failed to form groups");
      console.error(error);
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage applications, teams, and tasks</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex space-x-4">
          {[
            { id: "applications", label: "Applications", icon: "📝" },
            { id: "teams", label: "Teams", icon: "👥" },
            { id: "tasks", label: "Tasks", icon: "✅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pending Group Applications</h2>
              {selectedApplications.length > 0 && (
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedApplications.length} selected
                  </span>
                  <button
                    onClick={handleFormGroups}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Form Groups
                  </button>
                </div>
              )}
            </div>

            {!pendingApplications || pendingApplications.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Applications</h3>
                <p className="text-gray-600">All applications have been reviewed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApplications.map((app) => (
                  <div key={app._id} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(app._id)}
                        onChange={() => toggleApplicationSelection(app._id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {app.profile?.firstName} {app.profile?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize">
                              {app.profile?.experience} level
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {app.profile?.skills && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {app.profile.skills.slice(0, 5).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {app.profile.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{app.profile.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        )}

                        {app.coverLetter && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{app.coverLetter}</p>
                        )}

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewApplication(app._id, "approved")}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app._id, "shortlisted")}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app._id, "rejected")}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teams Tab */}
      {activeTab === "teams" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">👥</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
            <p className="text-gray-600">Advanced team management features coming soon</p>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Task Management</h2>
          
          {!allTasks || allTasks.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">✅</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
              <p className="text-gray-600">Task assignment features coming soon</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTasks.map((task) => (
                <div key={task._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <p className="text-sm text-gray-600">Team: {task.team?.name}</p>
                      <p className="text-sm text-gray-700 mt-1">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === "assigned" ? "bg-blue-100 text-blue-800" :
                        task.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                        task.status === "completed" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {task.status.replace("_", " ")}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
