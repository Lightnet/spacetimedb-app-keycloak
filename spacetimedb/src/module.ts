//-----------------------------------------------
// MODULE
//-----------------------------------------------
import { schema, table, t, SenderError  } from 'spacetimedb/server';
import { sessions } from './tables/table_session';
import { users } from './tables/table_user';

//-----------------------------------------------
// SCEHEMA
//-----------------------------------------------
const spacetimedb = schema({
  sessions,
  users,
});
//-----------------------------------------------
// INIT
//-----------------------------------------------
export const init = spacetimedb.init(async (_ctx) => {
  console.log("==== ::: INIT SPACETIMEDB APP NAME ::: ====");
  // console.log(setTimeout);
  // console.log(Bun)
  // await delayedTask("Bun Demo", 500);
});
//-----------------------------------------------
// ON CLIENT CONNECT
//-----------------------------------------------
export const onConnect = spacetimedb.clientConnected(ctx => {
  // ctx.connectionId is guaranteed to be defined
  const connId = ctx.connectionId!;

  console.log("jwt");
  const jwt = ctx.senderAuth.jwt;
  // console.log(jwt);

  console.log(jwt?.fullPayload);
  console.log(jwt?.subject);
  console.log(jwt?.issuer);
  if(!jwt) new SenderError('Auth Failed');

  if(jwt?.issuer =='http://localhost:8080/realms/myrealm'){
    console.log("username: ",jwt.fullPayload?.preferred_username)
    if(jwt.fullPayload?.preferred_username){
      let userName = String(jwt.fullPayload.preferred_username);
      let user = ctx.db.users.name.find(userName);
      // console.log("user:", user);
      // if does not exist create
      if(!user){
        user = ctx.db.users.insert({
          userId: ctx.newUuidV7().toString(),
          identity: ctx.sender,
          name: userName,
          online: true
        });
        console.log("data: ",user)
      }else{
        user.online =true
        ctx.db.users.userId.update(user);
      }
      // Initialize client session
      ctx.db.sessions.insert({
        connection_id: connId,
        identity: ctx.sender,
        connected_at: ctx.timestamp,
        userId: user.userId
      });
    }
  }else{
    throw new SenderError('Auth Failed');
  }
});
//-----------------------------------------------
// ON CLIENT DISCONNECT
//-----------------------------------------------
export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const connId = ctx.connectionId!;

  const session = ctx.db.sessions.connection_id.find(connId);
  if(session){
    if(session.userId){
      const _user = ctx.db.users.identity.find(ctx.sender)
      if(_user){
        _user.online = false;
        ctx.db.users.userId.update(_user);
      }
    }
  }
  ctx.db.sessions.connection_id.delete(connId);
});

export default spacetimedb;
