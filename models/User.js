import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: String,
  otpExpires: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1
      },
      logoUrl: { type: String, required: false },
      videoUrl: { type: String, required: false },
      customizationNote: { type: String, required: false }
    }
  ]
});

export default mongoose.model("User", userSchema);
