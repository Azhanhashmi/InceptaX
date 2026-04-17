// run once: node createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const admin = await Admin.create({
    name: "Super Admin",
    email: "admin12@gmail.com",   // ← your chosen email
    password: "123456", // ← your chosen password
    role: "super_admin",
  });
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });