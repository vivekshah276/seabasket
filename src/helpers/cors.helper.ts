import cors, { CorsOptions } from "cors";
import { Application } from "express";
import { env } from "@configs";

export class Cors {
  public static enable(app: Application): void {
    const corsOptions: CorsOptions = {
      origin(origin, callback) {
        if (process.env.NODE_ENV === "development") {
          // bypass check if dev
          callback(null, true);
        } else {
          const whitelist = (env.domain ?? "").split(","); // Ensures it's always a string
          if (origin && whitelist.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        }
      },
    };
    app.use(cors(corsOptions));
    app.options("*", cors());
  }
}
