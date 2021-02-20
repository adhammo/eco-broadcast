import * as mqtt from "mqtt";
import { MqttClient } from "mqtt";
import { options, topics } from "./config";

let client: MqttClient | null = null;

export const connect = (onConnect?: () => void, onDisconnect?: () => void) => {
  if (client) return;

  console.log("[broadcast]: connecting to mqtt broker.");
  client = mqtt.connect(options);

  client.on("connect", () => {
    console.log("[broadcast]: connected to mqtt broker.");
    if (onConnect) onConnect();
  });

  client.on("error", (err: Error) => {
    console.log(`[broadcast]: mqtt error (${err.name}: ${err.message}).`);
  });

  client.on("reconnect", () => {
    console.log("[broadcast]: reconnecting to mqtt broker.");
  });

  client.on("close", () => {
    console.log("[broadcast]: disconnected from mqtt broker.");
    if (onDisconnect) onDisconnect();
  });
};

export const isConnected = () => client?.connected ? true : false;

export const publishTemperature = (reading: number) => {
  if (!(client?.connected)) return;

  client.publish(topics.temperature, reading.toString(), { qos: 1 }, (err) => {
    if (err) console.log(`[broadcast]: publish error (${err.name}: ${err.message}).`);
  });
};

export const disconnect = () => {
  if (!client) return;

  console.log("[broadcast]: disconnecting from mqtt broker.");
  client.end();
  client = null;
};
