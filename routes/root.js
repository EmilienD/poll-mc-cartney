'use strict'
const randomWords = require('random-words')
const pollrooms = {}

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
  fastify.get('/pollrooms', (request, reply) => {
    reply.json(Object.keys(pollrooms))
  })
  fastify.get('/suggestion', (req, res) => {
    while (true) {
      const roomName = randomWords({ exactly: 3, join: '-' })
      if (!pollrooms[roomName]) {
        return { name: roomName }
      }
    }
  })
  fastify.get(
    '/pollrooms/:roomName',
    { websocket: true },
    (connection, req) => {
      const { roomName } = req.params
      if (!pollrooms[roomName]) {
        pollrooms[roomName] = {
          connections: [],
          question: '',
          answers: [],
        }
      }
      const currentRoom = pollrooms[roomName]
      currentRoom.connections.push(connection)
      connection.socket.on('close', () => {
        currentRoom.connections = currentRoom.connections.filter(
          (c) => c !== connection
        )
        if (!currentRoom.connections.length) {
          delete pollrooms[roomName]
        }
      })
      emitUpdate(currentRoom)(connection)
      connection.socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message)
        switch (parsedMessage.type) {
          case 'setQuestion':
            currentRoom.answers = []
            currentRoom.question = parsedMessage.question
            currentRoom.connections.forEach(emitUpdate(currentRoom))
            break
          case 'setAnswer':
            const answer = currentRoom.answers.find(
              (a) => a.userId === parsedMessage.userId
            )
            if (answer) {
              answer.answer = parsedMessage.answer
            } else {
              currentRoom.answers.push({
                userName: parsedMessage.userName,
                answer: parsedMessage.answer,
                userId: parsedMessage.userId,
              })
            }
            currentRoom.connections.forEach(emitUpdate(currentRoom))
            break
        }
      })
    }
  )
}

const emitUpdate = (currentRoom) => (connection) =>
  connection.socket.send(
    JSON.stringify({
      type: 'update',
      question: currentRoom.question,
      answers: currentRoom.answers.map((a) => ({
        answer: a.answer,
        userName: a.userName,
      })),
    })
  )