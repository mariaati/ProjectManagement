import { Suspense } from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import "./App.css";
import Register from "./views/Register";
import Login from "./views/Login";
import Home from "./views/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import RequiredUser from "./components/RequiredUser";
// import { getUserData } from "./utils/Utils";
import ProjectView from "./views/ProjectView";
import CreateProject from "./views/CreateProject";
import Projects from "./views/Projects";
import UpdateProject from "./views/UpdateProject";
import Faculty from "./views/Faculty";
import CreateFaculty from "./views/CreateFaculty";
import UpdateFaculty from "./views/UpdateFaculty";
import Technology from "./views/Technology";
import CreateTechnology from "./views/CreateTechnology";
import UpdateTechnology from "./views/UpdateTechnology";

function App() {
  const getRedirectRoute = () => {
    // const user = getUserData();
    return <Navigate to="/home" replace />;
  };
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={getRedirectRoute()} />
          <Route element={<RequiredUser allowedRoles={['admin']} />}>
            <Route path="projects" element={<Projects />} />
            <Route path="projects/create" element={<CreateProject />} />
            <Route path="projects/update/:id" element={<UpdateProject />} />
            <Route path="projects/view/:id" element={<ProjectView />} />

            <Route path="faculties" element={<Faculty />} />
            <Route path="faculties/create" element={<CreateFaculty />} />
            <Route path="faculties/update/:id" element={<UpdateFaculty />} />

            <Route path="technologies" element={<Technology />} />
            <Route path="technologies/create" element={<CreateTechnology />} />
            <Route path="technologies/update/:id" element={<UpdateTechnology />} />
          </Route>
          <Route path="home" element={<Home />} />
          <Route path="project-view/:id" element={<ProjectView />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </Suspense>
  );
}

export default App;
