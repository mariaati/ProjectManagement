import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useGetFacultiesQuery, useDeleteFacultyMutation } from "../redux/api/facultyAPI";

const Faculty = () => {
    const { data: faculties, isLoading, isError, refetch } = useGetFacultiesQuery();
    const [deleteFaculty, { isLoading: isDeleting }] = useDeleteFacultyMutation();
    useEffect(() => {
        refetch();
    }, [refetch]);
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this faculty?")) {
            try {
                await deleteFaculty(id).unwrap();
            } catch {
                alert("Failed to delete faculty");
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
                        to={`/faculties/update/${row.id}`}
                        className="btn btn-warning btn-sm m-1"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="btn btn-danger btn-sm  m-1"
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

    if (isLoading) return <p className="m-4">Loading faculties...</p>;
    if (isError) return <p className="m-4 text-danger">Failed to load faculties.</p>;

    return (
        <div className="container main-board">
            <div className="card shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Faculties</h3>
                    <Link to="/faculties/create" className="btn btn-primary">
                        + Add Faculty
                    </Link>
                </div>
                <div className="card-body">
                    <DataTable
                        columns={columns}
                        data={faculties || []}
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

export default Faculty;
