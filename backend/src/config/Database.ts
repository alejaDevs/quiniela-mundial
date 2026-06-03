import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri: string): Promise<void> => {
  if (mongoUri.length === 0) {
    throw new Error('MONGODB_URI is not configured');
  }

  await mongoose.connect(mongoUri);

  mongoose.connection.on('error', (error: Error): void => {
    // eslint-disable-next-line no-console
    console.error('[Mongoose] connection error', error);
  });
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
