import { Navigate, Outlet, Route, Routes, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationContext";
import { Loading, ErrorMessage } from "./components/UI";
import Auth from "./pages/Auth";
import Start from "./pages/Start";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Members from "./pages/Members";
import PortalLayout from "./layouts/PortalLayout";

function Protected() {
  const { user } = useAuth();
  return user ? (
    <OrganizationProvider key={user._id}>
      <Outlet />
    </OrganizationProvider>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  const { loading, error, retry } = useAuth();
  if (loading) return <Loading label="Loading application…" />;
  if (error)
    return (
      <main className="fatal">
        <ErrorMessage error={error} />
        <button className="btn primary" onClick={retry}>
          Try again
        </button>
      </main>
    );
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/app" element={<Protected />}>
          <Route index element={<Start />} />
          <Route path=":organizationId" element={<PortalLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="members" element={<Members />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <main className="fatal">
              <h1>Page not found</h1>
              <p>This page doesn’t exist.</p>
              <Link className="btn primary" to="/app">
                Back to dashboard
              </Link>
            </main>
          }
        />
      </Routes>
    </>
  );
}
