import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useScope } from "../context/OrganizationContext";
import { useResource } from "../hooks/useResource";
import { PageHeading, ResourceState, Empty } from "../components/UI";
import { ProjectForm } from "../components/Forms";
import ProjectCard from "../components/ProjectCard";

export default function Projects() {
  const { base, isManager } = useScope();
  const resource = useResource(`${base}/projects`);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const projects = (resource.data?.projects || []).filter((p) =>
    `${p.name} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="PROJECTS"
        title="Projects"
        description="Create and manage projects for this organization."
        action={
          isManager && (
            <button className="btn primary" onClick={() => setOpen(true)}>
              <Plus size={17} /> New project
            </button>
          )
        }
      />
      <div className="toolbar">
        <div className="search-field">
          <Search size={18} />
          <input
            aria-label="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a project…"
          />
        </div>
        <span className="muted">{projects.length} projects</span>
      </div>
      <ResourceState resource={resource}>
        {projects.length ? (
          <div className="project-grid">
            {projects.map((p, i) => (
              <ProjectCard key={p._id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <Empty
            title={query ? "No matching projects." : "No projects yet"}
            description={
              query
                ? "Try another search."
                : isManager
                  ? "Create your first project and give the team a place to begin."
                  : "An owner or admin can create a project for your team."
            }
          />
        )}
      </ResourceState>
      {open && (
        <ProjectForm onClose={() => setOpen(false)} onSaved={resource.reload} />
      )}
    </>
  );
}
