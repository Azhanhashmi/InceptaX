// run once: node createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await Admin.create({
    name: process.env.ADMIN_NAME,
   email: process.env.ADMIN_EMAIL,
password: process.env.ADMIN_PASSWORD,
    role: "admin",
  });
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
