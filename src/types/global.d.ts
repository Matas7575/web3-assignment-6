import { Server } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var _io: Server | undefined;
  
  namespace NodeJS {
    interface Global {
      _io: Server | undefined;
    }
  }
}