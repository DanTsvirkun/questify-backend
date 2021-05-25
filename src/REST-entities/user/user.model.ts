import mongoose, { Schema } from "mongoose";
import { IUser } from "../../helpers/typescript-helpers/interfaces";

const userSchema = new Schema({
  email: String,
  passwordHash: String,
  cards: [
    {
      title: String,
      difficulty: String,
      date: String,
      status: String,
      type: String,
    },
  ],
});

export default mongoose.model<IUser>("User", userSchema);
