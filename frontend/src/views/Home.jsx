import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProjectsQuery } from "../redux/api/projectAPI";
import { useGetFacultiesQuery } from "../redux/api/facultyAPI";
import { useGetTechnologiesQuery } from "../redux/api/technologyAPI";

const itemsPerPage = 10;

const Home = () => {
  const { data: projects = [], isLoading, isError, refetch } = useGetProjectsQuery();
  const { data: faculties = [] } = useGetFacultiesQuery();
  const { data: technologies = [] } = useGetTechnologiesQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState("All");
  const [selectedTechnology, setSelectedTechnology] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Collect unique years & study tracks from projects
  const uniqueYears = [...new Set(projects.map(p => p.submission_year).filter(Boolean))].sort((a, b) => b - a);
  const uniqueTracks = [...new Set(projects.map(p => p.study_track).filter(Boolean))];

  const filteredProjects = projects
    .filter(p => selectedFaculty === "All" || p.faculty_id === selectedFaculty)
    .filter(p =>
      selectedTechnology === "All" ||
      (p.technologies && p.technologies.some(tech =>
        (typeof tech === "object" ? tech.id === selectedTechnology : tech === selectedTechnology)
      ))
    )
    .filter(p => selectedYear === "All" || p.submission_year === selectedYear)
    .filter(p => selectedTrack === "All" || p.study_track === selectedTrack)
    .filter(p => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();

      // Convert project object values to string and search across all fields
      return Object.values(p).some(value => {
        if (!value) return false;

        if (typeof value === "string" || typeof value === "number") {
          return value.toString().toLowerCase().includes(search);
        }

        if (Array.isArray(value)) {
          return value.some(v =>
            (typeof v === "string" || typeof v === "number")
              ? v.toString().toLowerCase().includes(search)
              : typeof v === "object" &&
              Object.values(v).some(inner =>
                inner?.toString().toLowerCase().includes(search)
              )
          );
        }

        if (typeof value === "object") {
          return Object.values(value).some(inner =>
            inner?.toString().toLowerCase().includes(search)
          );
        }

        return false;
      });
    })



  // Sort filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!a.submission_year) return 1;
    if (!b.submission_year) return -1;

    return sortOrder === "latest"
      ? b.submission_year - a.submission_year
      : a.submission_year - b.submission_year;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedProjects = sortedProjects.slice(startIndex, startIndex + itemsPerPage);

  // Reset page if filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFaculty, selectedTechnology, searchTerm, sortOrder]);

  if (isLoading) return <p className="m-4">Loading projects...</p>;
  if (isError) return <p className="m-4 text-danger">Failed to load projects.</p>;

  return (
    <div className="container main-board">
      <div className="row">
        {/* Sidebar Filter */}
        <div className="col-md-3 mb-4">
          <div className="filter-sidebar p-3 shadow-sm rounded bg-white">
            <h5 className="mb-3">Filters</h5>
            <div className="filter-section">
              <h6 className="mb-2">Faculty/Department</h6>
              <ul className="list-unstyled">
                <li key="all-faculty">
                  <label className="form-check-label d-flex align-items-center">
                    <input
                      type="radio"
                      name="faculty"
                      value="All"
                      checked={selectedFaculty === "All"}
                      onChange={() => setSelectedFaculty("All")}
                      className="form-check-input me-2"
                    />
                    All
                  </label>
                </li>
                {faculties.map((faculty) => (
                  <li key={faculty.id}>
                    <label className="form-check-label d-flex align-items-center">
                      <input
                        type="radio"
                        name="faculty"
                        value={faculty.id}
                        checked={selectedFaculty === faculty.id}
                        onChange={() => setSelectedFaculty(faculty.id)}
                        className="form-check-input me-2"
                      />
                      {faculty.name}
                    </label>
                  </li>
                ))}
              </ul>

              <h6 className="mb-2 mt-4">Technology</h6>
              <ul className="list-unstyled">
                <li key="all-tech">
                  <label className="form-check-label d-flex align-items-center">
                    <input
                      type="radio"
                      name="technology"
                      value="All"
                      checked={selectedTechnology === "All"}
                      onChange={() => setSelectedTechnology("All")}
                      className="form-check-input me-2"
                    />
                    All
                  </label>
                </li>
                {technologies.map((tech) => (
                  <li key={tech.id}>
                    <label className="form-check-label d-flex align-items-center">
                      <input
                        type="radio"
                        name="technology"
                        value={tech.id}
                        checked={selectedTechnology === tech.id}
                        onChange={() => setSelectedTechnology(tech.id)}
                        className="form-check-input me-2"
                      />
                      {tech.name}
                    </label>
                  </li>
                ))}
              </ul>

              {/* Submission Year */}
              <h6 className="mb-2 mt-4">Submission Year</h6>
              <ul className="list-unstyled">
                <li>
                  <label>
                    <input
                      type="radio"
                      name="year"
                      value="All"
                      checked={selectedYear === "All"}
                      onChange={() => setSelectedYear("All")}
                      className="form-check-input me-2"
                    />
                    All
                  </label>
                </li>
                {uniqueYears.map((year) => (
                  <li key={year}>
                    <label>
                      <input
                        type="radio"
                        name="year"
                        value={year}
                        checked={selectedYear === year}
                        onChange={() => setSelectedYear(year)}
                        className="form-check-input me-2"
                      />
                      {year}
                    </label>
                  </li>
                ))}
              </ul>

              {/* Study Track */}
              <h6 className="mb-2 mt-4">Study Track</h6>
              <ul className="list-unstyled">
                <li>
                  <label>
                    <input
                      type="radio"
                      name="track"
                      value="All"
                      checked={selectedTrack === "All"}
                      onChange={() => setSelectedTrack("All")}
                      className="form-check-input me-2"
                    />
                    All
                  </label>
                </li>
                {uniqueTracks.map((track) => (
                  <li key={track}>
                    <label>
                      <input
                        type="radio"
                        name="track"
                        value={track}
                        checked={selectedTrack === track}
                        onChange={() => setSelectedTrack(track)}
                        className="form-check-input me-2"
                      />
                      {track}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="project-container p-3 shadow-sm rounded bg-white">
            {/* Header */}
            <div className="header-bar d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <input
                type="text"
                placeholder="Search for Projects"
                className="form-control search-input mb-2 flex-grow-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="result-info mb-2">
                <strong>{sortedProjects.length}</strong> Results | Sort by:{" "}
                <button
                  type="button"
                  className="btn btn-link p-0 sort-link"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"))
                  }
                  style={{ textDecoration: "underline", cursor: "pointer" }}
                >
                  {sortOrder === "latest" ? "Latest" : "Oldest"}
                </button>
              </div>
            </div>

            {selectedProjects.length > 0 ? (
              selectedProjects.map((project, i) => (
                <a
                  key={i}
                  className="project-link"
                  href={`/project-view/${project.id}`}
                >
                  <div className="project-card">
                    <div className="m-0">
                      <div className="project-details">
                        <h5 className="project-title">{project.title}</h5>
                        <p className="project-desc">{project.description}</p>
                        <div className="tags">
                          {project.main_topic && (
                            <span className="tag">{project.main_topic}</span>
                          )}
                        </div>
                        <p className="project-desc">Study track: {project.study_track}</p>
                        <p className="project-desc">Faculty/Department: {project.study_track}</p>
                        <p className="project-desc">Github Link: {project.github_link}</p>
                        <div className="tags">
                          {project.tags?.map((tag, i) => (
                            <span key={i} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="meta-info">
                          <span>⏱ {project?.created_at ? new Date(project.created_at).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '').replace('/', '-').replace('/', '-') : '—'}</span> |{" "}
                          <span>📌 {Number(project.average_rating).toFixed(2)} Marks</span>
                        </div>
                      </div>
                      <div className="price">
                        <span style={{ color: "black" }}>Submission Year: </span>{" "}
                        {project.submission_year}
                      </div>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-muted">No projects found for these filters.</p>
            )}

            {/* Pagination */}
            {sortedProjects.length > itemsPerPage && (
              <div className="pagination-wrapper d-flex align-items-center gap-2 mt-3">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="btn btn-outline-primary btn-sm"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="btn btn-outline-primary btn-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
