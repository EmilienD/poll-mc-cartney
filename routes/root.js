'use strict'
const randomWords = require('random-words')
const pollrooms = {}

module.exports = async function (fastify, opts) {
  fastify.get('/pollrooms', (request, reply) => {
    reply.send(Object.keys(pollrooms))
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
          respondents: new Map(),
        }
      }
      const currentRoom = pollrooms[roomName]
      currentRoom.connections.push(connection)
      connection.socket.on('close', () => {
        currentRoom.connections = currentRoom.connections.filter(
          (c) => c !== connection
        )
        currentRoom.respondents.delete(connection)
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
              answer.highlight = parsedMessage.highlight
            } else {
              currentRoom.answers.push({
                userName: parsedMessage.userName,
                answer: parsedMessage.answer,
                userId: parsedMessage.userId,
                highlight: parsedMessage.highlight,
              })
            }
            currentRoom.respondents.set(connection, {
              userId: parsedMessage.userId,
              userName: parsedMessage.userName,
            })
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
        highlight: a.highlight,
      })),
      respondents: Array.from(currentRoom.respondents.values()),
    })
  )
