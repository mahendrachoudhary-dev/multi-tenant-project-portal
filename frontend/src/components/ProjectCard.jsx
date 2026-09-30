import { Link } from "react-router-dom";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { useScope } from "../context/OrganizationContext";

export default function ProjectCard({ project, index = 0 }) {
  const { root } = useScope();
  return (
    <Link
      to={`${root}/projects/${project._id}`}
      className={`project-card tone-${index % 3}`}
    >
      <div className="project-card-top">
        <span className="project-icon">
          <FolderKanban size={22} />
        </span>
        <ArrowUpRight size={20} />
      </div>
      <h3>{project.name}</h3>
      <p>
        {project.description || "No description provided."}
      </p>
      <div className="project-card-footer">
        <span>{project.creator?.name || "Project creator"}</span>
        <span>
          {new Date(project.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
