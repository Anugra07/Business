import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function OpportunityMarketplace() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "startup",
    requiredSkills: "",
    timeCommitment: "part_time",
    duration: "",
    compensation: "",
    spotsAvailable: 1,
    applicationDeadline: "",
    tags: "",
  });

  const projects = useQuery(api.projects.getProjects, 
    selectedCategory === "all" ? {} : { category: selectedCategory }
  );
  const userProjects = useQuery(api.projects.getUserProjects);
  const createProject = useMutation(api.projects.createProject);

  const categories = [
    { id: "all", label: "All Opportunities" },
    { id: "startup", label: "Startup" },
    { id: "learning", label: "Learning" },
    { id: "freelance", label: "Freelance" },
    { id: "open_source", label: "Open Source" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProject({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        timeCommitment: formData.timeCommitment,
        duration: formData.duration || undefined,
        compensation: formData.compensation || undefined,
        spotsAvailable: formData.spotsAvailable,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).getTime() : undefined,
        tags: formData.tags.split(",").map(s => s.trim()).filter(Boolean),
      });

      toast.success("Project created successfully!");
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        category: "startup",
        requiredSkills: "",
        timeCommitment: "part_time",
        duration: "",
        compensation: "",
        spotsAvailable: 1,
        applicationDeadline: "",
        tags: "",
      });
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunity Marketplace</h1>
          <p className="text-gray-600 mt-2">Discover and create startup opportunities</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold"
        >
          Create Opportunity
        </button>
      </div>

      {/* Category Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Create New Opportunity</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="startup">Startup</option>
                  <option value="learning">Learning</option>
                  <option value="freelance">Freelance</option>
                  <option value="open_source">Open Source</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your project and what you're looking for..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills (comma-separated) *
                </label>
                <input
                  type="text"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="JavaScript, React, Design..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Commitment *
                </label>
                <select
                  name="timeCommitment"
                  value={formData.timeCommitment}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="part_time">Part Time</option>
                  <option value="full_time">Full Time</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="3 months, 6 months..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation
                </label>
                <input
                  type="text"
                  name="compensation"
                  value={formData.compensation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Equity, $50/hr, Unpaid..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spots Available *
                </label>
                <input
                  type="number"
                  name="spotsAvailable"
                  value={formData.spotsAvailable}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="remote, AI, fintech..."
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold"
              >
                Create Opportunity
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Available Opportunities</h2>
        
        {!projects || projects.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">🚀</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Opportunities Available</h3>
            <p className="text-gray-600">Be the first to create an opportunity!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{project.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.category === "startup" ? "bg-purple-100 text-purple-800" :
                    project.category === "learning" ? "bg-blue-100 text-blue-800" :
                    project.category === "freelance" ? "bg-green-100 text-green-800" :
                    "bg-orange-100 text-orange-800"
                  }`}>
                    {project.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div>💼 {project.timeCommitment.replace("_", " ")}</div>
                  {project.compensation && <div>💰 {project.compensation}</div>}
                  <div>👥 {project.spotsAvailable} spots available</div>
                </div>

                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {project.requiredSkills.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        +{project.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    by {project.creator?.firstName} {project.creator?.lastName}
                  </div>
                  <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-hover transition-colors text-sm font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Your Projects */}
      {userProjects && userProjects.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          <div className="space-y-4">
            {userProjects.map((project) => (
              <div key={project._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">
                      Created on {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{project.spotsAvailable} spots available</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === "open" ? "bg-green-100 text-green-800" :
                    project.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                    project.status === "completed" ? "bg-gray-100 text-gray-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {project.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
