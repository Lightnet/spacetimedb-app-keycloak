// main

import spacetimedb, {init , onConnect, onDisconnect } from './module';

export * from './views/view_user'

export {
  // spacetimedb predefine
  init,
  onConnect,
  onDisconnect,
}

export default spacetimedb;