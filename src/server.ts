import { json, urlencoded } from "body-parser";
import compression from "compression";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import methodOverride from "method-override";
import { DB, env } from "@configs";
import { Cors, EnvValidator, HandleUnhandledPromise, Log } from "@helpers";
import Routes from "./routes";
import { CartEntity, CartItemsEntity, CategoryProductEntity, OrderEntity, OrderItemEntity, ProductEntity, ReviewsEntity, UserEntity } from "@entities";

dotenv.config();

export default class App {
  protected app: express.Application;

  private logger = Log.getLogger();

  public async init() {
    // init DB.
    DB.init({
      type: env.dbType,
      host: env.dbHost,
      port: 5432,
      username: env.db_username,
      password: env.db_password,
      database: env.dbName,
      entities: [UserEntity, ProductEntity, CategoryProductEntity, CartEntity, CartItemsEntity, OrderEntity, OrderItemEntity, ReviewsEntity],
    });

    // Handle Unhandled Promise Rejections
    new HandleUnhandledPromise().init();

    // Validate ENV file
    EnvValidator.validate(env);

    // Init Express
    this.app = express();

    // Security
    Cors.enable(this.app);
    this.app.use(helmet());
    this.app.use(morgan("tiny"));
    this.app.use(compression());

    // Enable DELETE and PUT
    this.app.use(methodOverride());

    // Body Parsing
    this.app.use(json({ limit: "50mb" }));
    this.app.use(urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

    // Routing
    const routes = new Routes();
    this.app.use("/", routes.configure());

    // Start server
    this.app.listen(process.env.PORT, () => {
      this.logger.info(`The server is running in port localhost: ${process.env.PORT}`);
    });
  }

  public getExpresApp() {
    return this.app;
  }
}
