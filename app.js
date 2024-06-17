const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dpPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dpPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Start at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//API 1

app.get('/players/', async (request, response) => {
  const cricketTeam = `SELECT * FROM  cricket_team;`
  const listArray = await db.all(cricketTeam)

  response.send(
    listArray.map(eachPlayer => ({
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
      jerseyNumber: eachPlayer.jersey_number,
      role: eachPlayer.role,
    })),
  )
})

//API 2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO cricket_team(player_name, jersey_number, role)
    VALUES(
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    );
  `
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//API 3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerList = `
    SELECT * 
    FROM cricket_team
    WHERE 
    player_id = ${playerId};
  `
  const player = await db.get(getPlayerList)
  const camelCase = {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }
  response.send(camelCase)
})

//API 4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayerList = `
      UPDATE cricket_team
      SET 
          player_name = '${playerName}',
          jersey_number = ${jerseyNumber},
          role = '${role}'
      WHERE 
      player_id = ${playerId};
    `
  await db.run(updatePlayerList)
  response.send('Player Details Updated')
})

//API 5

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
      DELETE FROM cricket_team
      WHERE player_id = ${playerId};
    `
  await db.run(deletePlayer)
  response.send('Player Removed')
})

module.exports = app
