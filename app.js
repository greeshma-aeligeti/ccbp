const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDb= async()=>{
   try{
   db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
   }
   catch(e){
       console.log("DB error")
        process.exit(1);
   }
   
};
initializeDb();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get('/players/',async (request,response)=>{

    const query=`
    select * from cricket_team;
    `;
    const playersArray=await db.all(query);
   response.send(
 playersArray.map((eachPlayer) =>
convertDbObjectToResponseObject(eachPlayer)
)
);

})
app.post('/players/', async (request,response)=>{
    const playerDetails=request.body;
    const {playerName,jerseyNumber,role}=playerDetails;
    const addQuery=`
    Insert into cricket_team (player_name,jersey_number,role)
    values(
        '${playerName}',
        ${jerseyNumber},
       ' ${role}'
    );
    `;
    const resObj=await db.run(addQuery);
    response.send("Player Added to Team");
})
app.get('/players/:playerId',async (request,response)=>{
    const {playerId}=request.params;
    const getPlayerQuery=`
    select * from cricket_team where player_id=${playerId};
    `;
    const getPlayerRes=await db.get(getPlayerQuery);
  response.send(getPlayerRes);    
})
app.put('/players/:playerId',async (request,response)=>{
    const {playerId}    =request.params;
    const playerDetails=request.body;
    const {playerName,jerseyNumber,role}=playerDetails;
    const query=`
    update cricket_team
    set
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
where
player_id=${playerId};    
    `;
  const result=  await db.run(query);
    response.send("Player Details Updated")
});

app.delete('/players/:playerId',async (request,response)=>{
    const {playerId}=request.params;
    const query=`
    delete from cricket_team
    where player_id=${playerId};
    `;
   const del= await db.run(query);
    response.send("Player Removed");
})

module.exports=app;