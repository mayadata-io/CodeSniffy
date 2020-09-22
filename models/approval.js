const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApprovalSchema = new Schema({
  pullRequestURL: {
    type: String,
    required: true,
  },
  usersApproved: [String],
  approvals: {
    type: Number,
    required: true,
  },
});

module.exports = Person = mongoose.model("approval", ApprovalSchema);
