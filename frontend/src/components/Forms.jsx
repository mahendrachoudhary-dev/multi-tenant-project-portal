import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useOrganizations, useScope } from "../context/OrganizationContext";
import { AsyncForm, Modal } from "./UI";

export function OrganizationForm({ onClose }) {
  const { reload } = useOrganizations();
  const navigate = useNavigate();
  return (
    <Modal title="Create organization" onClose={onClose}>
      <p className="muted">
        Create an organization. You will be assigned the Owner role.
      </p>
      <AsyncForm
        label="Create organization"
        onCancel={onClose}
        onSubmit={async (body) => {
          const { organization } = await api("/organizations", {
            method: "POST",
            body,
          });
          reload();
          onClose();
          navigate(`/app/${organization._id}`);
        }}
      >
        <label>
          Organization name
          <input
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Acme Inc."
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            maxLength={1000}
            placeholder="Describe the organization."
          />
        </label>
      </AsyncForm>
    </Modal>
  );
}

export function ProjectForm({ project, onClose, onSaved }) {
  const { base } = useScope();
  return (
    <Modal
      title={project ? "Edit project" : "Create project"}
      onClose={onClose}
    >
      <AsyncForm
        label={project ? "Save project" : "Create project"}
        onCancel={onClose}
        onSubmit={async (body) => {
          await api(`${base}/projects${project ? `/${project._id}` : ""}`, {
            method: project ? "PATCH" : "POST",
            body,
          });
          onSaved();
          onClose();
        }}
      >
        <label>
          Project name
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={project?.name}
            placeholder="e.g. Website Redesign"
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            maxLength={2000}
            defaultValue={project?.description}
            placeholder="Describe the project scope and objectives."
          />
        </label>
      </AsyncForm>
    </Modal>
  );
}

export function TaskForm({ task, projectId, members, onClose, onSaved }) {
  const { base } = useScope();
  return (
    <Modal title={task ? "Edit task" : "Create task"} onClose={onClose}>
      <AsyncForm
        label={task ? "Save task" : "Create task"}
        onCancel={onClose}
        onSubmit={async (body) => {
          body.assignee = body.assignee || null;
          body.dueDate = body.dueDate || null;
          await api(
            `${base}/projects/${projectId}/tasks${task ? `/${task._id}` : ""}`,
            { method: task ? "PATCH" : "POST", body },
          );
          onSaved();
          onClose();
        }}
      >
        <label>
          Task title
          <input
            name="title"
            required
            maxLength={160}
            defaultValue={task?.title}
            placeholder="Enter task title"
            autoFocus
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            maxLength={4000}
            defaultValue={task?.description}
            placeholder="Describe the task requirements."
          />
        </label>
        <div className="form-grid">
          <label>
            Status
            <select name="status" defaultValue={task?.status || "TODO"}>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label>
            Priority
            <select name="priority" defaultValue={task?.priority || "MEDIUM"}>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
          </label>
          <label>
            Assign to
            <select name="assignee" defaultValue={task?.assignee?._id || ""}>
              <option value="">Unassigned</option>
              {members
                .filter((m) => m.user)
                .map((m) => (
                  <option key={m._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              name="dueDate"
              defaultValue={task?.dueDate?.slice(0, 10) || ""}
            />
          </label>
        </div>
      </AsyncForm>
    </Modal>
  );
}

export function MemberForm({ onClose, onSaved }) {
  const { organization, base } = useScope();
  return (
    <Modal title="Add organization member" onClose={onClose}>
      <p className="muted">
        Add someone who has already registered, using their account email.
      </p>
      <AsyncForm
        label="Add member"
        onCancel={onClose}
        onSubmit={async (body) => {
          await api(`${base}/members`, { method: "POST", body });
          onSaved();
          onClose();
        }}
      >
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="teammate@example.com"
            autoFocus
          />
        </label>
        <label>
          Organization role
          <select name="role">
            <option value="MEMBER">
              Member — projects & task collaboration
            </option>
            {organization.role === "OWNER" && (
              <option value="ADMIN">Admin — project & member management</option>
            )}
          </select>
        </label>
      </AsyncForm>
    </Modal>
  );
}
