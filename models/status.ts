import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    status_name: { type: String, required: [true, 'Status name is required']},
    type_id: { type: String, required: [true, 'Type is required'] },
    description: { type: String,  required: [true, 'Description is required'],},
    isactive: { type: Boolean, default: true  },
  },
  {
    timestamps: true,
  }
);

const Status = mongoose.models?.Status || mongoose.model("Status", statusSchema);
export default Status;
