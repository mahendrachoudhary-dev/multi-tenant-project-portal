import { Component, useEffect, useRef, useState } from "react";
import {
  X,
  ArrowUpRight,
  LoaderCircle,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

export const Brand = () => (
  <span className="brand" aria-label="MULTI-TENANT PROJECT">
    <span className="brand-mark" aria-hidden="true">
      MT
    </span>
    <span>
      MULTI-TENANT<span className="brand-sub">PROJECT</span>
    </span>
  </span>
);

export const Avatar = ({ name = "?", small = false }) => (
  <span aria-hidden="true" className={`avatar ${small ? "small" : ""}`}>
    {name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()}
  </span>
);

export const Badge = ({ value }) => (
  <span className={`badge ${value?.toLowerCase()}`}>
    {value?.replaceAll("_", " ")}
  </span>
);

export const ErrorMessage = ({ error }) =>
  error ? (
    <div role="alert" className="error">
      <AlertCircle size={18} />
      <span>{error.message || error}</span>
    </div>
  ) : null;

export function Loading({ label = "Loading…" }) {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={24} />
      {label}
    </div>
  );
}

export function ResourceState({ resource, children }) {
  if (resource.loading) return <Loading />;
  if (resource.error)
    return (
      <div className="panel">
        <ErrorMessage error={resource.error} />
        <button className="btn secondary" onClick={resource.reload}>
          Try again
        </button>
      </div>
    );
  return children;
}

export const Empty = ({ title, description, action }) => (
  <div className="empty">
    <FolderOpen size={32} />
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
);

export const PageHeading = ({ eyebrow, title, description, action }) => (
  <header className="page-heading">
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action}
  </header>
);

export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-header">
        <h2 id="modal-title">{title}</h2>
        <button
          className="icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function AsyncForm({
  onSubmit,
  children,
  label = "Save changes",
  onCancel,
  danger = false,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <ErrorMessage error={error} />
      <fieldset disabled={busy}>
        {children}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className={`btn ${danger ? "danger" : "primary"}`}
            type="submit"
          >
            {busy ? (
              <>
                <LoaderCircle size={16} className="spin" />
                Saving…
              </>
            ) : (
              <>
                {label}
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export function ConfirmDelete({ title, description, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="muted">{description}</p>
      <AsyncForm
        onSubmit={onConfirm}
        onCancel={onClose}
        label="Delete permanently"
        danger
      />
    </Modal>
  );
}

export class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="fatal">
        <h1>Something went wrong.</h1>
        <p>Please reload the page to try again.</p>
        <button className="btn primary" onClick={() => location.reload()}>
          Reload page
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
