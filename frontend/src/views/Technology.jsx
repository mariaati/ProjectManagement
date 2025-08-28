import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useGetTechnologiesQuery, useDeleteTechnologyMutation } from "../redux/api/technologyAPI";

const Technology = () => {
    const { data: technologies, isLoading, isError, refetch } = useGetTechnologiesQuery();
    const [deleteTechnology, { isLoading: isDeleting }] = useDeleteTechnologyMutation();

    useEffect(() => {
        refetch();
    }, [refetch]);
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this technology?")) {
            try {
                await deleteTechnology(id).unwrap();
            } catch {
                alert("Failed to delete technology");
            }
        }
    };

    const columns = [
        {
            name: "#",
            selector: (_, idx) => idx + 1,
            width: "60px",
        },
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            wrap: true,
        },
        {
            name: "Description",
            selector: (row) => row.description || "-",
            wrap: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="flex gap-2">
                    <Link
                        to={`/technologies/update/${row.id}`}
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
            width: "140px",
        },
    ];

    if (isLoading) return <p className="m-4">Loading technologies...</p>;
    if (isError) return <p className="m-4 text-danger">Failed to load technologies.</p>;

    return (
        <div className="container main-board">
            <div className="card shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Technologies</h3>
                    <Link to="/technologies/create" className="btn btn-primary">
                        + Add Technology
                    </Link>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={technologies || []}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        noHeader
                        defaultSortField="name"
                    />
                </div>
            </div>
        </div>
    );
};

export default Technology;
