import { EventEmitter } from "events";

class TokenEmitter extends EventEmitter {}

export const tokenEmitter = new TokenEmitter();
tokenEmitter.setMaxListeners(200);

export function emitDoctorTokenChange(doctorId: string) {
  tokenEmitter.emit(`tokens:${doctorId}`);
}
