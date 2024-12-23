const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }, // URL לתמונה

  // שדות מותאמים לאפליקציית קומיקס
  favoriteComics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }], // רשימת קומיקסים מועדפים
  createdComics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }], // קומיקסים שנוצרו על ידי המשתמש
  preferredGenres: [{ type: String }], // ז'אנרים מועדפים
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
