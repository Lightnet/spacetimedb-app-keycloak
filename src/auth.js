// notes
// - it need the url to prase the access
// - it need to click twice to login since it need url from query catch.

import van from "vanjs-core";
import Keycloak from 'keycloak-js';
import { DbConnection, tables } from './module_bindings';

const { div, input, textarea, button, span, img, label, p, table, tr, td, tbody } = van.tags;

const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetime-app-keycloak';
// const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

var conn;
const stateNetwork = van.state('Offline');
const isLogin = van.state(false);
const userName = van.state('Guest');

const keycloak = new Keycloak({
    url: "http://localhost:8080",
    realm: "myrealm",
    clientId: "spacetimedb-app"
});

async function login(){
  console.log("login...");
  try {
    const authenticated = await keycloak.init({
      onLoad: 'login-required', // works
      // checkLoginIframe: false,
    });
    if (authenticated) {
        // console.log(authenticated);
        console.log('User is authenticated');
        const token = keycloak.idToken; 
        console.log("ID Token:", token);
        
        // Connect to SpacetimeDB using this token
        connectToSpacetime(token);
    } else {
        console.log('User is not authenticated');
    }
  } catch (error) {
      console.error('Failed to initialize adapter:', error);
  }
}

// login();

function connectToSpacetime(token){
  conn = DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(token) // Use the Keycloak ID Token here
    .onConnect((conn, identity) => {
      console.log("Connected as identity:", identity.toHexString());
      stateNetwork.val = "Connect";
      isLogin.val = true;
      setupDB();
    })
    .build();
}

// test
function onInsert_User(_ctx, row){
  console.log(row);
  userName.val = row.name;
}

function setupDB(){
  conn.subscriptionBuilder()
    .subscribe(tables.users)
  conn.db.users.onInsert(onInsert_User);
}

async function logout() {
  // 1. Close the SpacetimeDB connection
  if (conn) {
    conn.disconnect();
    stateNetwork.val = "Close";
  }

  // 2. Clear local session & redirect to Keycloak logout
  await keycloak.logout({
    redirectUri: 'http://localhost:5173'
  });
}

const accessEL = van.derive(()=>{
  if(isLogin.val){
    return div(
      button({onclick:logout}, 'Logout'),
    )
  }else{
    return div(
      button({onclick:login}, 'Login'),
      button({onclick:onSignup},"Register")
    )
  }
});

async function onSignup(){
  // Returns a Promise containing the direct registration URL
  try {
    // 1. You MUST init first
    const authenticated = await keycloak.init();
    // 2. Now 'register' is defined and safe to call
    keycloak.register(); 
  } catch (error) {
    console.error("Initialization failed", error);
  }
}

function App(){
  return div(
    div(label("Network:"),label(stateNetwork)),
    accessEL,
    div(
      label("User Name:"), label(userName)
    )
  )
}

van.add(document.body, App())