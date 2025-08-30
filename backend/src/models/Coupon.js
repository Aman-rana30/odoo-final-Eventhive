import mongoose from "mongoose"

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["PERCENT", "FIXED", "BOGO", "GROUP"], required: true },
    value: { type: Number, required: true },
    minAmount: Number,
    maxDiscount: Number,
    validFrom: Date,
    validTo: Date,
    usageLimitGlobal: Number,
    usagePerUser: Number,
    applicableEventIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.model("Coupon", couponSchema)
