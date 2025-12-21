import mongoose from 'mongoose';

export const ensureConnection = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    throw new Error('Database not connected.');
  }
  
  if (mongoose.connection.readyState !== 1) {
    throw new Error(`Database connection is not ready. State: ${mongoose.connection.readyState}`);
  }
};

export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};




