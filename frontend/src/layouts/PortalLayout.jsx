import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Plus,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOrganizations, ScopeContext } from "../context/OrganizationContext";
import { orgPath } from "../services/api";
import { Avatar, Brand, ErrorMessage, ResourceState } from "../components/UI";
import { OrganizationForm } from "../components/Forms";

export default function PortalLayout() {
  const resource = useOrganizations();
  const { organizationId } = useParams();
  const organization = resource.organizations.find(
    (o) => o._id === organizationId,
  );
  return (
    <ResourceState resource={resource}>
      {organization ? (
        <OrganizationView key={organizationId} organization={organization} />
      ) : (
        <main className="fatal">
          <h1>Organization unavailable</h1>
          <p>You may not have access to this organization.</p>
          <Link to="/app" className="btn primary">
            Your organizations
          </Link>
        </main>
      )}
    </ResourceState>
  );
}

function OrganizationView({ organization }) {
  const { organizations } = useOrganizations();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [newOrg, setNewOrg] = useState(false);
  const [error, setError] = useState(null);
  const root = `/app/${organization._id}`;
  useEffect(() => {
    localStorage.setItem("portal-organization", organization._id);
  }, [organization._id]);
  const value = {
    organization,
    isManager: ["OWNER", "ADMIN"].includes(organization.role),
    base: orgPath(organization._id),
    root,
  };
  return (
    <ScopeContext.Provider value={value}>
      <div className="app-shell">
        <aside className="sidebar">
          <Link
            className="brand-link"
            to={root}
            aria-label="MULTI-TENANT PROJECT dashboard"
          >
            <Brand />
          </Link>
          <div className="workspace-select">
            <label htmlFor="workspace">ACTIVE ORGANIZATION</label>
            <select
              id="workspace"
              value={organization._id}
              onChange={(e) => navigate(`/app/${e.target.value}`)}
            >
              {organizations.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name}
                </option>
              ))}
            </select>
            <button className="new-workspace" onClick={() => setNewOrg(true)}>
              <Plus size={14} /> New organization
            </button>
          </div>
          <nav aria-label="Application navigation">
            <span className="nav-label">NAVIGATION</span>
            <NavLink end to={root}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to={`${root}/projects`}>
              <FolderKanban size={18} /> Projects
            </NavLink>
            <NavLink to={`${root}/members`}>
              <Users size={18} /> Members
            </NavLink>
          </nav>
          <div className="sidebar-note">
            <span className="note-star">✳</span>
            <h3>Organization access</h3>
            <p>
              Projects and tasks belong
              <br />
              to the selected organization.
            </p>
            <Link to={`${root}/projects`}>
              View organization projects <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="sidebar-user">
            <Avatar name={user.name} />
            <div>
              <strong>{user.name}</strong>
              <small>{organization.role.toLowerCase()}</small>
            </div>
            <button
              className="icon-btn"
              aria-label="Sign out"
              onClick={() => signOut().catch(setError)}
            >
              <LogOut size={17} />
            </button>
          </div>
        </aside>
        <div className="workspace-main">
          <header className="topbar">
            <span>
              <span className="status-dot" /> {organization.name}
              <span className="topbar-separator">/</span>
              <span className="muted">Project Portal</span>
            </span>
            <span className="topbar-right">
              PROJECT PORTAL <Avatar name={user.name} small />
            </span>
            <button
              className="icon-btn mobile-signout"
              aria-label="Sign out"
              onClick={() => signOut().catch(setError)}
            >
              <LogOut size={17} />
            </button>
          </header>
          <main id="main-content" className="main-content">
            <ErrorMessage error={error} />
            <Outlet />
          </main>
          <footer className="workspace-footer">
            Organizations · Projects · Tasks<span>MULTI-TENANT PROJECT</span>
          </footer>
        </div>
      </div>
      {newOrg && <OrganizationForm onClose={() => setNewOrg(false)} />}
    </ScopeContext.Provider>
  );
}
