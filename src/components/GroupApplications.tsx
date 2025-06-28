import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function GroupApplications() {
  const [showForm, setShowForm] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const userApplications = useQuery(api.applications.getUserApplications);
  const submitApplication = useMutation(api.applications.submitGroupApplication);
  const generateUploadUrl = useMutation(api.profiles.generateUploadUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
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
        resumeId: storageId,
        coverLetter: coverLetter || undefined,
      });

      toast.success("Application submitted successfully!");
      setShowForm(false);
      setCoverLetter("");
      setResumeFile(null);
    } catch (error) {
      toast.error("Failed to submit application");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const groupApplications = userApplications?.filter(app => app.type === "group_application") || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Applications</h1>
          <p className="text-gray-600 mt-2">Apply for guaranteed 4-person team formation within 24 hours</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold"
          >
            Apply for Group
          </button>
        )}
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Submit Group Application</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
              <p className="text-sm text-gray-500 mt-1">PDF, DOC, or DOCX format</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Tell us why you want to join a group and what you bring to the team..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isUploading}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50"
              >
                {isUploading ? "Submitting..." : "Submit Application"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Application Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
        
        {groupApplications.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">📝</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Submit your first group application to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupApplications.map((app) => (
              <div key={app._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Group Application</h3>
                    <p className="text-sm text-gray-600">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    {app.coverLetter && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{app.coverLetter}</p>
                    )}
                  </div>
                  <div className="text-right">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How Group Formation Works</h3>
        <div className="space-y-2 text-blue-800">
          <p>• Submit your application with resume and optional cover letter</p>
          <p>• Applications are reviewed by our team</p>
          <p>• Groups of 4 people are formed based on complementary skills</p>
          <p>• You'll be notified within 24 hours of group formation</p>
          <p>• Start collaborating with your new team immediately!</p>
        </div>
      </div>
    </div>
  );
}
