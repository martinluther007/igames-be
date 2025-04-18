import { Schema, model } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    required: [true, "A user must have a username"],
    unique: true,
  },
  wins: { type: Number, default: 0 },
});

const USER = model("user", userSchema);

export default USER;
