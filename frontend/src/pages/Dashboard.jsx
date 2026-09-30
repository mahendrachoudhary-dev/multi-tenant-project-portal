import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  FolderKanban,
  CheckCheck,
  Timer,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useScope } from "../context/OrganizationContext";
import { useResource } from "../hooks/useResource";
import { PageHeading, ResourceState, Empty } from "../components/UI";
import ProjectCard from "../components/ProjectCard";
export default function Dashboard() {
  const { user } = useAuth();
  const { base, root } = useScope();
  const stats = useResource(`${base}/stats`);
  const projects = useResource(`${base}/projects`);
  const s = stats.data?.stats;
  const progress = s?.total ? Math.round((s.done / s.total) * 100) : 0;
  return (
    <>
      <PageHeading
        eyebrow="DASHBOARD"
        title={`Welcome, ${user.name.split(" ")[0]}.`}
        description="View projects, task progress and members in the selected organization."
      />
      <div className="overview-grid">
        <section className="welcome-banner">
          <span className="eyebrow light">MULTI-TENANT PROJECT PORTAL</span>
          <h2>
            Manage projects.
            <br />
            <em>Track tasks.</em>
          </h2>
          <p>
            Projects, tasks and organization members.
            <br />
            Managed in one application.
          </p>
          <Link className="btn cream" to={`${root}/projects`}>
            View projects <ArrowUpRight size={17} />
          </Link>
          <div className="banner-orbit" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
        </section>
        <section className="progress-panel">
          <span className="eyebrow">TASK COMPLETION</span>
          <h3>Organization progress</h3>
          <ResourceState resource={stats}>
            <div
              className="progress-ring"
              style={{ "--progress": `${progress}%` }}
            >
              <div>
                <strong>{progress}%</strong>
                <span>completed</span>
              </div>
            </div>
            <p>
              {s?.done || 0} of {s?.total || 0} tasks complete
            </p>
          </ResourceState>
        </section>
      </div>
      <ResourceState resource={stats}>
        <section className="stats-grid" aria-label="Organization statistics">
          {[
            [FolderKanban, "Projects", s?.projects, "Total projects"],
            [Timer, "In progress", s?.inProgress, "Active tasks"],
            [CheckCheck, "Completed", s?.done, "Tasks marked done"],
            [Users, "Team members", s?.members, "Organization members"],
          ].map(([Icon, label, count, note]) => (
            <article className="stat" key={label}>
              <div>
                <span>{label}</span>
                <Icon size={19} />
              </div>
              <strong>{count || 0}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>
      </ResourceState>
      <div className="section-heading">
        <div>
          <span className="eyebrow">PROJECTS</span>
          <h2>Recent projects</h2>
        </div>
        <Link className="text-link" to={`${root}/projects`}>
          View all projects <ArrowUpRight size={16} />
        </Link>
      </div>
      <ResourceState resource={projects}>
        {projects.data?.projects.length ? (
          <div className="project-grid">
            {projects.data.projects.slice(0, 3).map((p, i) => (
              <ProjectCard key={p._id} project={p} index={i} />
            ))}
          </div>
        ) : (
          <Empty
            title="No projects yet"
            description="Create a project to begin organizing your team’s work."
            action={
              <Link className="btn secondary" to={`${root}/projects`}>
                Open projects
              </Link>
            }
          />
        )}
      </ResourceState>
    </>
  );
}
