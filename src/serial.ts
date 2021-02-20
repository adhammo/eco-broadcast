import SerialPort, { list, parsers } from "serialport";

export const getPorts = async () => {
  console.log(`[broadcast]: fetching serial ports.`);

  const ports = await list();

  console.log(`[broadcast]: fetched serial ports.`);
  return ports.map((port) => ({ path: port.path, manufacturer: port.manufacturer }));
};

let serial: SerialPort | null = null;
export const open = (
  path: string,
  onOpen?: () => void,
  onReading?: (value: number) => void,
  onClose?: () => void
) => {
  if (serial) return;

  console.log(`[broadcast]: opening serial port ${path}.`);
  serial = new SerialPort(path, {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    autoOpen: false,
  });

  serial.open((err) => {
    if (err) {
      console.log(`[broadcast]: error opening port (${err.name}: ${err.message}).`);
    }
  });

  serial.on("open", () => {
    console.log("[broadcast]: opened serial port.");
    if (onOpen) onOpen();
  });

  const parser = serial.pipe(new parsers.ByteLength({ length: 2 }));
  parser.on("data", (data) => {
    if (onReading) onReading(((data[1] << 8) + data[0]) * (50.0 / 1023.0));
  });

  serial.on("error", (err: Error) => {
    console.log(`[broadcast]: serial error (${err.name}: ${err.message}).`);
  });

  serial.on("close", () => {
    console.log("[broadcast]: closed serial port.");
    if (onClose) onClose();
  });
};

export const isOpened = () => (serial?.isOpen ? true : false);

export const close = () => {
  if (!serial) return;

  console.log("[broadcast]: closing serial port.");
  serial.close((err) => {
    if (err) {
      console.log(`[broadcast]: error closing serial (${err.name}: ${err.message}).`);
    }
  });
  serial = null;
};
