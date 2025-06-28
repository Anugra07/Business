import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function WolfPackProjects() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const wolfPackTeams = useQuery(api.teams.getTeamsByType, { type: "wolf_pack" });
  const userApplications = useQuery(api.applications.getUserApplications);
  const submitApplication = useMutation(api.applications.submitWolfPackApplication);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const handleApply = async (teamId: string) => {
    setSelectedTeam(teamId);
    setShowApplicationForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !resumeFile) {
      toast.error("Please upload your resume");
      return;
    }

    setIsUploading(true);
    try {
      // Upload resume
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": resumeFile.type },
        body: resumeFile,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      
      const { storageId } = await result.json();

      // Submit application
      await submitApplication({
        teamId: selectedTeam as any,
        resumeId: storageId,
        coverLetter: coverLetter || undefined,
      });

      toast.success("Application submitted successfully!");
      setShowApplicationForm(false);
      setSelectedTeam(null);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error) {
      toast.error("Failed to submit application");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const wolfPackApplications = userApplications?.filter(app => app.type === "wolf_pack") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wolf Pack Projects</h1>
        <p className="text-gray-600 mt-2">Join existing teams and ongoing projects</p>
      </div>

      {/* Available Teams */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Available Teams</h2>
        
        {!wolfPackTeams || wolfPackTeams.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🐺</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wolf Pack Teams Available</h3>
            <p className="text-gray-600">Check back later for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wolfPackTeams.map((team) => (
              <div key={team._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <span className="text-sm text-gray-500">
                    {team.currentMembers}/{team.maxMembers} members
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{team.description}</p>
                
                {team.tags && team.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {team.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {team.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{team.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Created by {team.creator?.firstName} {team.creator?.lastName}
                  </div>
                  <button
                    onClick={() => handleApply(team._id)}
                    disabled={team.currentMembers >= team.maxMembers}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {team.currentMembers >= team.maxMembers ? "Full" : "Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Apply to Team</h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (Required) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Why do you want to join this team?"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Your Applications */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Your Wolf Pack Applications</h2>
        
        {wolfPackApplications.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No applications submitted yet</p>
        ) : (
          <div className="space-y-4">
            {wolfPackApplications.map((app) => (
              <div key={app._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {(app as any).team?.name || "Team Application"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    app.status === "approved" ? "bg-green-100 text-green-800" :
                    app.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
