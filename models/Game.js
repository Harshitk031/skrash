const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  playerName: { type: String, required: true },
  socID: { type: String, required: true },
  isRoomOwner: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
});

const GameSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  players: [PlayerSchema],
  hasGameStarted: { type: Boolean, default: false },
  wordToDraw: { type: String },
  chosenPlayer: { type: String },
  guessersList: { type: [String], default: [] },
  scoreBoard: { type: [[String, Number]], default: [] },
  roundNumber: { type: Number, default: 0 },
  totalRounds: { type: Number, default: 4 },
  playerIndex: { type: Number, default: 0 },
});

module.exports = mongoose.model('Game', GameSchema);
