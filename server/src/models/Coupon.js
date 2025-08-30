import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["PERCENT", "FIXED", "BOGO", "GROUP", "EARLY_BIRD"], required: true },
    value: { type: Number, required: true },
    minAmount: Number,
    maxDiscount: Number,
    validFrom: Date,
    validTo: Date,
    usageLimitGlobal: Number,
    usagePerUser: Number,
    applicableEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

export const Coupon = mongoose.model("Coupon", couponSchema)
