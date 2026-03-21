import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    seats: { type: Number, default: 5 },
    apiKey: {
      type: String,
      unique: true,
      default: () => `sk_${crypto.randomBytes(24).toString('hex')}`,
    },
    webhookUrl: { type: String, default: null },
  },
  { timestamps: true },
);

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
