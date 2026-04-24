# spacetimedb-app-keycloak

# License: MIT

# SpaceTimeDB
 - 2.1.0

# Information:
  This is auth for keycloak project with some basic sample tests. This use Podman.

- https://github.com/keycloak/keycloak

# What is SpaceTimeDB?:
  It all in one database, server module and command line tools. The server module use api call from SpaceTimedb for web browser to access the server. Which they need to export to client module to work.

# Authentication:
  There are couple of way to authentication access due to restricted sandbox webassembly. By using the third party auth packages. It use OpenID Connect (OIDC) identity tokens for authentication.

  How does it work. Auth Keycloak required to setup certificate. Like those https certificate. But since testing in dev so we don't need. As well set up account to access SpaceTimeDB.

  SpaceTimeDB has it own jwt and certificate which it need to hand shake.

  Once the user login or register by proxy site that SpaceTimeDB server module script to allow. It would need jwt token once login and pass to web socket to auth checks. ONce the jwt token is pass to SpaceTimeDB server it would check the token who made and send request to the keycloak server.

  The server module can filter out the jwt.

- https://spacetimedb.com/docs/core-concepts/authentication/usage

## server
```ts
export const onConnect = spacetimedb.clientConnected(ctx => {
  const jwt = ctx.senderAuth.jwt;
  if (jwt == null) {
    throw new SenderError('Unauthorized: JWT is required to connect');
  }
  // http://< keycloak dev server >/realms/< name realm >
  if(jwt?.issuer =='http://localhost:8080/realms/myrealm'){
    //process data here
    // check  user data if exist if not create data.
  }else{
    // note 2.1.0 there no error on reject auth yet. Can't find it in docs.
    throw new SenderError('Auth Failed');
  }
})
```
## client:
```js
const keycloak = new Keycloak({
    url: "http://localhost:8080", // < keycloak dev server >
    realm: "myrealm",             // < name realm >
    clientId: "spacetimedb-app"   // client name app.
});
```

## Can be found in:
- https://spacetimedb.com/docs/core-concepts/authentication
- https://dev.to/insiderto/how-to-obtain-an-oidc-id-token-for-spacetimedb-using-nextjs-and-auth0-1ci
- https://www.npmjs.com/package/keycloak-js
- https://www.keycloak.org/securing-apps/javascript-adapter

# Config:
  Make sure the application database name match the server and client. Since using the ***spacetime dev*** command line to run development mode to watch and build.

## Podman and Keycloak:
  Note this is required to set up keycloak auth server to work to connect to SpaceTimeDB for cert token to pass.

- https://www.keycloak.org/getting-started/getting-started-podman

```
podman run -p 127.0.0.1:8080:8080 -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:26.6.1 start-dev
```
 - Quick Command.

### Create client:
```
Current Realm
- myrealm (realm name)
  - clients
    - Client ID: spacetimedb-app (create client)
    - all default just the name and url need to added.
    - settings
      - client id: spacetimedb-app ( for browser client id name)
      - Access settings
        - Valid redirect URIs
          - http://localhost:5173/*
        - Web origins
          - http://localhost:5173
```
### register:
 The register is disable by default.
```
Current Realm
- myrealm
  - config
    - settings:
      - login
        - user registration on
```

### admin
```
- manage realms
  - master
- manage
  - user 
    - create user
  - select the user created
    - click on the user name to access for User details
    - go to role mapping
      - click on the Assign role (drop down) > realm roles
        - add admin role
```


## Client
```js
const DB_NAME = 'spacetime-app-keycloak';
```
## server:
spacetime.json
```json
//...
"database": "spacetime-app-keycloak",
//...
```
spacetime.local.json
```json
//...
"database": "spacetime-app-keycloak",
//...
```

# Commands:
```
bun install
```
```
spacetime start
```
```
spacetime dev --server local
```
# sql:
```
spacetime sql --server local spacetime-app-keycloak "SELECT * FROM users"
```

```
spacetime sql --server local spacetime-app-keycloak "SELECT * FROM sessions"
```

# Delete
```
spacetime publish --server local spacetime-app-keycloak --delete-data
```
```
spacetime publish --server local spacetime-app-keycloak -c
```