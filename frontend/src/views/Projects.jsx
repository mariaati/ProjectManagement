import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useGetProjectsQuery, useDeleteProjectMutation } from "../redux/api/projectAPI";

const Projects = () => {
    const { data: projects, isLoading, isError, refetch } = useGetProjectsQuery();
    const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

    // New states for CSV import
    const [csvFile, setCsvFile] = useState(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        refetch();
    }, [refetch]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await deleteProject(id).unwrap();
            } catch (err) {
                alert("Failed to delete project");
            }
        }
    };

    // New handler for CSV import
    const handleCsvImport = async () => {
        if (!csvFile) {
            alert("Please select a CSV file first");
            return;
        }

        const formData = new FormData();
        formData.append("file", csvFile);

        setImporting(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_ENDPOINT}/api/projects/import-csv`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Import failed");
            alert("Projects imported successfully");
            setCsvFile(null);
            refetch();
        } catch (err) {
            alert("Failed to import CSV: " + err.message);
        } finally {
            setImporting(false);
        }
    };

    const columns = [
        {
            name: "#",
            selector: (_, idx) => idx + 1,
            width: "60px",
            sortable: false,
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
            wrap: true,
        },
        {
            name: "Faculty",
            selector: (row) => row.faculty?.name || "-",
            sortable: true,
            wrap: true,
        },
        {
            name: "Technologies",
            selector: (row) => {
                // If row.technologies exists and is an array, map to names and join with ", "
                if (Array.isArray(row.technologies) && row.technologies.length > 0) {
                    return row.technologies.map(t => t?.name ?? "").filter(n => n).join(", ");
                }
                return "-";
            },
            sortable: false,
            wrap: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <Link
                        to={`/projects/update/${row.id}`}
                        className="btn btn-warning btn-sm m-1"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="btn btn-danger btn-sm m-1"
                        disabled={isDeleting}
                    >
                        Delete
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "160px",
        },
    ];

    if (isLoading) return <p className="m-4">Loading projects...</p>;
    if (isError) return <p className="m-4 text-danger">Failed to load projects.</p>;

    return (
        <div className="container main-board">
            <div className="card shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Projects</h3>
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setCsvFile(e.target.files[0])}
                            disabled={importing}
                            className="form-control form-control-sm"
                            style={{ maxWidth: "250px" }}
                        />
                        <button
                            className="btn btn-success btn-sm"
                            onClick={handleCsvImport}
                            disabled={importing}
                        >
                            {importing ? "Importing..." : "Import CSV"}
                        </button>
                        <Link to="/projects/create" className="btn btn-primary btn-sm">
                            + Add Project
                        </Link>
                    </div>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={projects || []}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        noHeader
                        defaultSortField="title"
                    />
                </div>
            </div>
        </div>
    );
};

export default Projects;
