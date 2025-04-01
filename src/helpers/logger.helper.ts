import moment from "moment";
import { createLogger, format, transports } from "winston";
import { env } from "@configs";

const { combine, timestamp, colorize, metadata, label } = format;

export class Log {
  public static getLogger(labelName = "no-label") {
    const logFormat = format.printf(info => {
      const { metadata: logMeta, message = "" } = info;
      let metadataToPrint = "";
      if (logMeta && Object.keys(logMeta).length > 0) {
        metadataToPrint = `\n${JSON.stringify(logMeta, null, 2)}`;
      }
      return `${info.timestamp} ${info.level} [${info.label}]: ${message}${metadataToPrint}`;
    });

    const logger = createLogger({
      level: process.env.LOG_LEVEL || "debug",
      format: combine(label({ label: labelName }), timestamp(), metadata({ fillExcept: ["message", "level", "timestamp", "label"] })),
      transports: [],
    });

    if (["production", "development"].includes(env.nodeEnv)) {
      // TODO: Replace following with Cloudwatch
      logger.add(
        new transports.Console({
          format: combine(colorize(), logFormat),
        }),
      );
    } else {
      logger.add(
        new transports.Console({
          format: combine(colorize(), logFormat),
        }),
      );
    }

    return logger;
  }

  private static timestampFormat: string = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
}
