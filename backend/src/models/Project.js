import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      immutable: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    // Every task mutation touches this revision in its transaction. Deleting the
    // project writes the same document, preventing a concurrent orphan task.
    revision: { type: Number, default: 0, select: false },
  },
  { timestamps: true },
);
schema.index({ organization: 1, createdAt: -1 });
export default mongoose.model("Project", schema);
