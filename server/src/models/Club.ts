import mongoose, { Document, Schema } from 'mongoose';

export interface IClub extends Document {
  name: string;
  description: string;
  category: string;
  capacity: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      minlength: [3, 'Club name must be at least 3 characters'],
      maxlength: [100, 'Club name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['SPORTS', 'ARTS', 'SCIENCE', 'MUSIC', 'ACADEMIC', 'OTHER'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

export const Club = mongoose.model<IClub>('Club', ClubSchema);






