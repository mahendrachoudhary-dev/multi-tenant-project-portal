import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowDownRight, Layers3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AsyncForm, Brand } from "../components/UI";

export default function Auth({ mode }) {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const register = mode === "register";
  if (user) return <Navigate to="/app" replace />;
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="story-main">
          <span className="eyebrow light">MERN STACK APPLICATION</span>
          <h1>
            Multi-Tenant
            <br />
            Project
            <br />
            <em>Portal.</em>
          </h1>
          <p>
            Manage organizations, memberships, projects and tasks with secure
            access for each organization.
          </p>
          <div className="story-art">
            <Layers3 size={70} strokeWidth={1} />
            <span>
              Organizations.
              <br />
              Projects. Tasks.
            </span>
            <ArrowDownRight size={40} />
          </div>
        </div>
        <span className="story-foot">
          MULTI-TENANT PROJECT &nbsp; / &nbsp; ORGANIZATIONS • PROJECTS • TASKS
        </span>
      </section>
      <section className="auth-form">
        <div className="auth-top">
          {register ? "Already registered?" : "Need an account?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"} ↗
          </Link>
        </div>
        <div className="auth-form-inner">
          <div className="eyebrow">USER AUTHENTICATION</div>
          <h2>{register ? "Create account" : "Sign in"}</h2>
          <p className="muted">
            {register
              ? "Register to create or join an organization."
              : "Sign in to access your organizations and projects."}
          </p>
          <AsyncForm
            key={mode}
            label={register ? "Create account" : "Sign in"}
            onSubmit={async (body) => {
              await signIn(mode, body);
              navigate("/app", { replace: true });
            }}
          >
            {register && (
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  placeholder="Mahendra Choudhary"
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={register ? 12 : 1}
                maxLength={128}
                placeholder={
                  register ? "At least 12 characters" : "Enter your password"
                }
              />
            </label>
          </AsyncForm>
          <p className="auth-note">
            Organization-based access to projects and tasks.
          </p>
        </div>
        <div className="auth-bottom">
          © {new Date().getFullYear()} MULTI-TENANT PROJECT
        </div>
      </section>
    </main>
  );
}
