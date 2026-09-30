import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER"],
      default: "MEMBER",
      required: true,
    },
  },
  { timestamps: true },
);
schema.index({ organization: 1, user: 1 }, { unique: true });
schema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Membership", schema);
