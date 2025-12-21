import { Document } from 'mongoose';

const transformId = (obj: any) => {
  if (!obj) return obj;
  if (typeof obj === 'string') return obj;
  if (obj._id) {
    return {
      ...obj,
      id: obj._id.toString(),
      _id: undefined,
    };
  }
  if (obj.id) {
    return obj;
  }
  return obj;
};

export const transformEvent = (event: any) => {
  const obj = event.toObject ? event.toObject() : event;
  const transformed = {
    ...obj,
    id: obj._id ? obj._id.toString() : obj.id,
    _id: undefined,
    date: obj.date ? (obj.date instanceof Date ? obj.date.toISOString() : obj.date) : null,
    createdAt: obj.createdAt ? (obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt) : new Date().toISOString(),
    updatedAt: obj.updatedAt ? (obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : obj.updatedAt) : new Date().toISOString(),
  };
  
  if (transformed.club) {
    transformed.club = transformId(transformed.club);
  }
  
  return transformed;
};

