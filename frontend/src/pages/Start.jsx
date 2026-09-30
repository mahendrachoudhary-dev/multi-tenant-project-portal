import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useOrganizations } from "../context/OrganizationContext";
import { useAuth } from "../context/AuthContext";
import { Brand, Empty, ResourceState, ErrorMessage } from "../components/UI";
import { OrganizationForm } from "../components/Forms";

export default function Start() {
  const resource = useOrganizations();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const saved = localStorage.getItem("portal-organization");
  const org =
    resource.organizations.find((o) => o._id === saved) ||
    resource.organizations[0];
  if (!resource.loading && org)
    return <Navigate to={`/app/${org._id}`} replace />;
  return (
    <main className="onboarding">
      <Brand />
      <ErrorMessage error={error} />
      <ResourceState resource={resource}>
        <Empty
          title="No organizations yet"
          description="Create your first organization, or ask a organization owner to add your registered email."
          action={
            <>
              <button className="btn primary" onClick={() => setOpen(true)}>
                Create organization ↗
              </button>
              <button className="btn secondary" onClick={resource.reload}>
                Refresh memberships
              </button>
            </>
          }
        />
      </ResourceState>
      <button className="text-button" onClick={() => signOut().catch(setError)}>
        Sign out
      </button>
      {open && <OrganizationForm onClose={() => setOpen(false)} />}
    </main>
  );
}
