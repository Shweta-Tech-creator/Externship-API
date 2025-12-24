import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import getMyDbConnection from "../config/mydb.js";

const myDbUserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true }
  },
  { collection: "users", timestamps: true }
);

// Hash password
myDbUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

myDbUserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const conn = getMyDbConnection();
let MyDbUser;

try {
  MyDbUser = conn?.model("MyDbUser") || conn?.model("MyDbUser", myDbUserSchema);
} catch {
  MyDbUser = mongoose.models.MyDbUser || mongoose.model("MyDbUser", myDbUserSchema);
}

export default MyDbUser;
