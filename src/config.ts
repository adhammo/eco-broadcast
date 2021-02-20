import { IClientOptions } from "mqtt";
import { config as configureEnv } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

const result = configureEnv({ path: join(__dirname, "..", ".env") });
if (result.error) throw result.error;

export const options: IClientOptions = {
  protocol: "mqtts",
  port: parseInt(process.env.MQTT_BROKER_PORT!),
  host: process.env.MQTT_BROKER_HOST,
  username: process.env.MQTT_BROKER_USERNAME,
  password: process.env.MQTT_BROKER_PASSWORD,
  ca: [readFileSync(join(__dirname, "..", "maqiatto.crt"))],
  rejectUnauthorized: false,
};

export const topics = { temperature: "adhamacc1@gmail.com/temp" };
