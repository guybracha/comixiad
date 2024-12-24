const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// מודל המשתמש
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" }, // URL לתמונת פרופיל

    // שדות מותאמים לאפליקציית קומיקס
    favoriteComics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }], // קומיקסים מועדפים
    createdComics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comic" }], // קומיקסים שנוצרו ע"י המשתמש
    preferredGenres: [{ type: String }], // ז'אנרים מועדפים
  },
  { timestamps: true }
);

// הצפנת סיסמה לפני שמירתה
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// מתודה לאימות סיסמה
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
