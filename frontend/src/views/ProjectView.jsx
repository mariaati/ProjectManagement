import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetProjectQuery } from "../redux/api/projectAPI";
import { getToken, getUserData } from "../utils/Utils";

const ProjectView = () => {
    const { id } = useParams();
    const { data: projectData, isLoading: isFetchingProject } = useGetProjectQuery(id);
    const user = getUserData();
    const token = getToken();
    const userId = user?.id;
    const [userRating, setUserRating] = useState(null); // user's existing rating (if any)
    const [newRating, setNewRating] = useState(0);
    const [rateDescription, setRateDescription] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserRating() {
            if (!id || !userId) return;

            try {
                const res = await fetch(
                    `${import.meta.env.VITE_SERVER_ENDPOINT}/api/projects/ratings?projectId=${id}&userId=${userId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    if (data.rating) {
                        setUserRating(data.rating);
                        setNewRating(data.rating);
                        setRateDescription(data.description || '');
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchUserRating();
    }, [id, userId]);

    const handleRate = async () => {
        if (newRating < 1 || newRating > 5) {
            alert("Please select a rating between 1 and 5.");
            return;
        }

        if (!userId) {
            navigate('/login');
            return;
        }

        setRatingLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_ENDPOINT}/api/projects/ratings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ 
                    projectId: id, 
                    userId, 
                    rating: newRating, 
                    description: rateDescription 
                }),
            });

            if (res.ok) {
                alert("Rating submitted!");
                setUserRating(newRating);
                setRateDescription('');
            } else {
                const errorData = await res.json().catch(() => null);
                const message = errorData?.message ?? "Failed to submit rating.";
                alert(message);
            }
        } catch (err) {
            alert("Error submitting rating.");
        } finally {
            setRatingLoading(false);
        }
    };

    if (isFetchingProject) return <div className="container mt-4">Loading project data...</div>;
    if (!projectData) return <div className="container mt-4">Project not found.</div>;

    const {
        title,
        description,
        main_topic,
        submission_year,
        study_track,
        faculty,
        github_link,
        live_link,
        youtube_link,
        document_link,
        media,
        technologies,
        // add other fields as needed
    } = projectData;

    const normalizeMedia = (input) => {
        if (!input) return [];
        try {
            const parsed = typeof input === "string" ? JSON.parse(input) : input;
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return Array.isArray(input) ? input.filter(Boolean) : [];
        }
    }

    const mediaArray = normalizeMedia(media);

    return (
        <div className="container main-board">
            <div className="project-detail p-4 shadow rounded bg-white">
                <h2 className="fw-bold">{title}</h2>
                <p className="text-muted mb-4">{description}</p>

                <table className="table table-bordered mb-4" style={{ maxWidth: "600px" }}>
                    <tbody>
                        <tr>
                            <th>Main Topic</th>
                            <td>{main_topic || "-"}</td>
                        </tr>
                        <tr>
                            <th>Submission Year</th>
                            <td>{submission_year || "-"}</td>
                        </tr>
                        <tr>
                            <th>Study Track</th>
                            <td>{study_track || "-"}</td>
                        </tr>
                        <tr>
                            <th>Faculty</th>
                            <td>{faculty?.name || "-"}</td>
                        </tr>
                        <tr>
                            <th>Technologies</th>
                            <td>
                                {technologies?.length > 0 ? (
                                    <ul className="mb-0">
                                        {technologies.map((tech) => (
                                            <li key={tech.id}>{tech.name}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    "-"
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="mb-4">
                    <a href={github_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark me-2">
                        View on GitHub
                    </a>
                    {live_link && (
                        <a href={live_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-success me-2">
                            Live Demo
                        </a>
                    )}
                    {youtube_link && (
                        <a href={youtube_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-danger me-2">
                            Watch on YouTube
                        </a>
                    )}
                    {document_link && (
                        <a href={document_link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info">
                            Read Document
                        </a>
                    )}
                </div>

                <h4>Media</h4>
                <div className="media-images d-flex flex-wrap mb-4">
                    {mediaArray.length > 0 ? (
                        mediaArray.map((mediaFile, i) => (
                            <img
                                key={i}
                                src={`${import.meta.env.VITE_SERVER_ENDPOINT}/uploads/projects/${mediaFile}`}
                                alt={`Media ${i + 1}`}
                                className="img-thumbnail me-2 mb-2"
                                style={{ maxWidth: "150px" }}
                            />
                        ))
                    ) : (
                        <p>No media available.</p>
                    )}
                </div>
                
                <div className="rating-section mb-4">
                    <h5>Your Rating</h5>
                    {userRating ? (
                        <p>You rated this project: <strong>{userRating} / 5</strong></p>
                    ) : (
                        <>
                            <select
                                value={newRating}
                                onChange={(e) => setNewRating(Number(e.target.value))}
                                disabled={ratingLoading}
                                className="form-select mb-2"
                                style={{ maxWidth: "120px" }}
                            >
                                <option value={0}>Select rating</option>
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>

                            <textarea
                                className="form-control mb-2"
                                value={rateDescription}
                                onChange={(e) => setRateDescription(e.target.value)}
                                placeholder="Enter your review..."
                                rows="3"
                                disabled={ratingLoading}
                            />

                            <button
                                className="btn btn-primary"
                                onClick={handleRate}
                                disabled={ratingLoading || newRating === 0}
                            >
                                {ratingLoading ? "Submitting..." : "Submit Rating"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectView;
