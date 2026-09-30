import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Search,
  ArrowLeft,
} from "lucide-react";
import { useScope } from "../context/OrganizationContext";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
import {
  Avatar,
  Badge,
  PageHeading,
  ResourceState,
  Empty,
  ConfirmDelete,
} from "../components/UI";
import { ProjectForm, TaskForm } from "../components/Forms";

const statuses = [
  ["TODO", "To do"],
  ["IN_PROGRESS", "In progress"],
  ["DONE", "Done"],
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  return <ProjectContent key={projectId} projectId={projectId} />;
}

function ProjectContent({ projectId }) {
  const { base, root, isManager } = useScope();
  const navigate = useNavigate();
  const projectResource = useResource(`${base}/projects/${projectId}`);
  const tasks = useResource(`${base}/projects/${projectId}/tasks`);
  const members = useResource(`${base}/members`);
  const [dialog, setDialog] = useState(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("");
  const project = projectResource.data?.project;
  const visible = (tasks.data?.tasks || []).filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) &&
      (!priority || t.priority === priority) &&
      (!status || t.status === status) &&
      (!assignee ||
        (assignee === "unassigned"
          ? !t.assignee
          : t.assignee?._id === assignee)),
  );

  return (
    <ResourceState resource={projectResource}>
      {project && (
        <>
          <Link className="back-link" to={`${root}/projects`}>
            <ArrowLeft size={16} /> All projects
          </Link>
          <PageHeading
            eyebrow="PROJECT DETAILS"
            title={project.name}
            description={
              project.description ||
              "Manage the tasks assigned to this project."
            }
            action={
              <div className="button-group">
                {isManager && (
                  <>
                    <button
                      className="icon-btn bordered"
                      aria-label="Edit project"
                      onClick={() => setDialog({ type: "project" })}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-btn bordered"
                      aria-label="Delete project"
                      onClick={() => setDialog({ type: "delete-project" })}
                    >
                      <Trash2 size={17} />
                    </button>
                  </>
                )}
                <button
                  className="btn primary"
                  disabled={members.loading || !!members.error}
                  onClick={() => setDialog({ type: "task" })}
                >
                  <Plus size={16} /> New task
                </button>
              </div>
            }
          />
          <div className="toolbar task-toolbar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Search tasks"
                placeholder="Find a task…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              {["LOW", "MEDIUM", "HIGH"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              aria-label="Filter status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map(([s, name]) => (
                <option key={s} value={s}>
                  {name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">All members</option>
              <option value="unassigned">Unassigned</option>
              {members.data?.members
                .filter((m) => m.user)
                .map((m) => (
                  <option value={m.user._id} key={m._id}>
                    {m.user.name}
                  </option>
                ))}
            </select>
          </div>
          <ResourceState resource={members}>
            <ResourceState resource={tasks}>
              <div className="board">
                {statuses
                  .filter(([s]) => !status || s === status)
                  .map(([s, label]) => (
                    <section
                      className={`board-column column-${s.toLowerCase()}`}
                      key={s}
                    >
                      <div className="column-heading">
                        <h2>
                          <span className="status-dot" />
                          {label}
                        </h2>
                        <span>
                          {visible.filter((t) => t.status === s).length}
                        </span>
                      </div>
                      <div className="task-stack">
                        {visible
                          .filter((t) => t.status === s)
                          .map((task) => (
                            <article className="task-card" key={task._id}>
                              <div className="task-card-top">
                                <Badge value={task.priority} />
                                <div>
                                  <button
                                    className="icon-btn"
                                    aria-label={`Edit task ${task.title}`}
                                    onClick={() =>
                                      setDialog({ type: "task", task })
                                    }
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    className="icon-btn"
                                    aria-label={`Delete task ${task.title}`}
                                    onClick={() =>
                                      setDialog({ type: "delete-task", task })
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <h3>{task.title}</h3>
                              <p>
                                {task.description || "No description provided."}
                              </p>
                              <div className="task-meta">
                                <span>
                                  {task.assignee ? (
                                    <>
                                      <Avatar small name={task.assignee.name} />
                                      {task.assignee.name}
                                    </>
                                  ) : (
                                    "Unassigned"
                                  )}
                                </span>
                                {task.dueDate && (
                                  <span>
                                    <CalendarDays size={13} />
                                    {new Date(
                                      task.dueDate.slice(0, 10) + "T00:00:00",
                                    ).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                            </article>
                          ))}
                        {!visible.some((t) => t.status === s) && (
                          <div className="column-empty">
                            No tasks in this status.
                          </div>
                        )}
                      </div>
                    </section>
                  ))}
              </div>
              {!visible.length && (query || priority || assignee || status) && (
                <Empty
                  title="No tasks match these filters."
                  description="Adjust the filters to see more of your team’s work."
                />
              )}
            </ResourceState>
          </ResourceState>
          {dialog?.type === "project" && (
            <ProjectForm
              project={project}
              onClose={() => setDialog(null)}
              onSaved={projectResource.reload}
            />
          )}{" "}
          {dialog?.type === "task" && (
            <TaskForm
              task={dialog.task}
              projectId={projectId}
              members={members.data?.members || []}
              onClose={() => setDialog(null)}
              onSaved={tasks.reload}
            />
          )}{" "}
          {dialog?.type === "delete-project" && (
            <ConfirmDelete
              title="Delete this project?"
              description="This will permanently delete the project and all of its tasks."
              onClose={() => setDialog(null)}
              onConfirm={async () => {
                await api(`${base}/projects/${projectId}`, {
                  method: "DELETE",
                });
                navigate(`${root}/projects`);
              }}
            />
          )}{" "}
          {dialog?.type === "delete-task" && (
            <ConfirmDelete
              title="Delete this task?"
              description={`“${dialog.task.title}” will be permanently removed.`}
              onClose={() => setDialog(null)}
              onConfirm={async () => {
                await api(
                  `${base}/projects/${projectId}/tasks/${dialog.task._id}`,
                  { method: "DELETE" },
                );
                setDialog(null);
                tasks.reload();
              }}
            />
          )}
        </>
      )}
    </ResourceState>
  );
}
