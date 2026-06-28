import dotenv from "dotenv";
import { connectDatabase, disconnectDatabase } from "../config/Database";
import { UserModel } from "../models/User";
import { PredictionModel } from "../models/Prediction";

dotenv.config();

// Username or displayName of the user to remove from all leaderboards
const TARGET = "Carlos N";

const run = async (): Promise<void> => {
  await connectDatabase(process.env.MONGODB_URI ?? "");
  // eslint-disable-next-line no-console
  console.log("[RemoveFromLeague] Conectado a MongoDB\n");

  const user = await UserModel.findOne({
    $or: [
      { username: new RegExp(`^${TARGET}$`, "i") },
      { displayName: new RegExp(`^${TARGET}$`, "i") },
    ],
  });

  if (!user) {
    // eslint-disable-next-line no-console
    console.error(`ERROR: Usuario "${TARGET}" no encontrado.`);
    await disconnectDatabase();
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`Usuario encontrado: ${user.username} (${user.displayName})  id=${user._id}`);

  const result = await PredictionModel.deleteMany({ user: user._id });
  // eslint-disable-next-line no-console
  console.log(`Predicciones eliminadas: ${result.deletedCount}`);

  // eslint-disable-next-line no-console
  console.log("\nListo. El usuario ya no aparecerá en ninguna liga ni historial.");
  await disconnectDatabase();
};

run().catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
