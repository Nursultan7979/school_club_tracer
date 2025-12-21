import mongoose, { Document, Schema } from 'mongoose';

export interface IMembership extends Document {
  user: mongoose.Types.ObjectId;
  club: mongoose.Types.ObjectId;
  joinedAt: Date;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<IMembership>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    club: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Club is required'],
    },
    joinedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MembershipSchema.index({ user: 1, club: 1 }, { unique: true });

export const Membership = mongoose.model<IMembership>('Membership', MembershipSchema);






