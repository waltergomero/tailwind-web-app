import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: [true, 'First name is required']},
    last_name: { type: String, required: [true, 'Last name is required'] },
    name: { type: String,  required: [true, 'Name is required'],},
    image: { type: String,},
    provider: { type: String,},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isadmin: {  type: Boolean, default: false },
    isactive: { type: Boolean, default: true  },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
