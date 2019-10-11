const mongoose = require('mongoose');

const { Schema } = mongoose;

const leaderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      default: '',
    },
    abbr: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Leaders = mongoose.model('Leader', leaderSchema);
module.exports = Leaders;
