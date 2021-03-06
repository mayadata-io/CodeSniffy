const dotenv = require("dotenv");

dotenv.config();

const label = {
  XS: "size/XS",
  S: "size/S",
  M: "size/M",
  L: "size/L",
  XL: "size/XL",
  XXL: "size/XXL",
};

const colors = {
  "size/XS": "3CBF00",
  "size/S": "5D9801",
  "size/M": "7F7203",
  "size/L": "A14C05",
  "size/XL": "C32607",
  "size/XXL": "E50009",
  "area/litmus-portal": "ADD6FF",
  "area/kubera-chaos": "4CBFAD",
  "DO NOT MERGE": "f47e7e",
  "READY TO MERGE": "B8FF33",
  "PR: Changes Requested": "FFFF66",
};

const sizes = {
  S: 10,
  M: 30,
  L: 100,
  Xl: 500,
  Xxl: 1000,
};

module.exports = {
  label,
  colors,
  sizes,
  mongoURL: process.env.MONGO_DB_URI,
};
