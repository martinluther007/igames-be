import { Schema, model } from "mongoose";

const gameSessionSchema = new Schema({
  startTime: {
    type: Date,
    required: [true, "A game session must have a timestamp"],
  },
  players: [{ userId: String, selectedNumber: Number }],
  correctNumber: {
    type: Number,
    required: [true, "A game session must have a correct number"],
  },
  winners: [Schema.Types.ObjectId],
});

const GAME_SESSION = model("game session", gameSessionSchema);

export default GAME_SESSION;
