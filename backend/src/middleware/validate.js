import { z } from "zod";

export const id = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid ID.");
const text = (max) => z.string().trim().min(1).max(max);
const email = z
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());
const password = z.string().min(12, "Use at least 12 characters.").max(128);
const description = (max) => z.string().trim().max(max);

export const schemas = {
  register: z.strictObject({ name: text(80), email, password }),
  login: z.strictObject({ email, password: z.string().min(1).max(128) }),
  organization: z.strictObject({
    name: text(100),
    description: description(1000).default(""),
  }),
  member: z.strictObject({
    email,
    role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
  }),
  project: z.strictObject({
    name: text(120),
    description: description(2000).optional(),
  }),
  task: z.strictObject({
    title: text(160),
    description: description(4000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assignee: id.nullable().optional(),
    dueDate: z.iso.date().nullable().optional(),
  }),
};

export const validate = (schema) => (req, res, next) => {
  req.input = schema.parse(req.body);
  next();
};

export const validateIds = (req, res, next) => {
  for (const value of Object.values(req.params)) id.parse(value);
  next();
};

export function patch(schema) {
  return schema
    .partial()
    .refine(
      (value) => Object.keys(value).length > 0,
      "Provide at least one field.",
    );
}
