// this test fail auth token.
// note there no error on disconnect for reject test

import van from "vanjs-core";
import Keycloak from 'keycloak-js';
import { DbConnection } from './module_bindings';

const { div, button, label } = van.tags;
const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-keycloak';

var conn;
const stateNetwork = van.state('Offline');
const isLogin = van.state(false);

function connectToSpacetime(){
  conn = DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(null) // Use the Keycloak ID Token here
    .onConnect((conn, identity) => {
      console.log("Connected as identity:", identity.toHexString());
      stateNetwork.val = "Connect";
      isLogin.val = true;
    })
    .onDisconnect((ctx, error) => {
      console.log('Disconnected from SpacetimeDB');
      stateNetwork.val = 'Disconnected';
      console.log(ctx);
      console.log(ctx.event);
      console.log(conn);
      console.log(error);
    })
    .onConnectError((_ctx, error) => {
      console.error('Connection error:', error);
      stateNetwork.val = 'Connection error';
      // statusEl.textContent = 'Error: ' + error.message;
      // statusEl.style.color = 'red';
    })
    .build();
}

function App(){
  return div(
    // accessEL,    
    label("Network:"),
    label(stateNetwork),
    button({},"Register")
  )
}

van.add(document.body, App())

connectToSpacetime();