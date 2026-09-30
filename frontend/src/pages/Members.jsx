import { useState } from "react";
import { Plus, Building2 } from "lucide-react";
import { useScope } from "../context/OrganizationContext";
import { useResource } from "../hooks/useResource";
import { Avatar, Badge, PageHeading, ResourceState } from "../components/UI";
import { MemberForm } from "../components/Forms";
export default function Members() {
  const { organization, base, isManager } = useScope();
  const resource = useResource(`${base}/members`);
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="ORGANIZATION MEMBERS"
        title="Members"
        description="View organization information, membership and roles."
        action={
          isManager && (
            <button className="btn primary" onClick={() => setOpen(true)}>
              <Plus size={16} /> Add member
            </button>
          )
        }
      />
      <section className="organization-card">
        <div className="project-icon">
          <Building2 size={24} />
        </div>
        <div>
          <h2>{organization.name}</h2>
          <p>{organization.description || "No organization description provided."}</p>
          <span className="organization-id">
            Organization ID: {organization._id}
          </span>
        </div>
        <Badge value={organization.role} />
      </section>
      <ResourceState resource={resource}>
        <section className="members-panel">
          <div className="table-heading">
            <h2>Organization members</h2>
            <span className="muted">
              {resource.data?.members.length} members
            </span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Member</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {resource.data?.members
                  .filter((m) => m.user)
                  .map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div className="member-cell">
                          <Avatar name={m.user.name} />
                          <div>
                            <strong>{m.user.name}</strong>
                            <span>{m.user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge value={m.role} />
                      </td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </ResourceState>
      <p className="role-note">
        Owners and admins manage projects and add registered teammates. All
        members can collaborate on tasks. Only owners can add admins.
      </p>
      {open && (
        <MemberForm onClose={() => setOpen(false)} onSaved={resource.reload} />
      )}
    </>
  );
}
