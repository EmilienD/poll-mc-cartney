import { initPollLinksClipboard, makeRoomLink } from './common.js'

const updateRoomLinks = (roomName) => {
  document
    .getElementById('answerLink')
    .setAttribute('href', makeAnswerRoomLink(roomName))
  document
    .getElementById('askLink')
    .setAttribute('href', makeAskRoomLink(roomName))
}

const makeAnswerRoomLink = makeRoomLink('answerPoll.html')
const makeAskRoomLink = makeRoomLink('askPoll.html')

const suggestName = () => {
  fetch('/suggestion')
    .then((res) => res.json())
    .then(({ name }) => {
      document.getElementById('roomName').value = name
      updateRoomLinks(name)
    })
}

const init = async () => {
  fetch('/pollrooms')
    .then((res) => res.json())
    .then((rooms) => {
      const listElements = rooms.map((roomName) => {
        const a = document.createElement('a')
        a.setAttribute('href', makeAnswerRoomLink(roomName))
        a.innerText = roomName
        const li = document.createElement('li')
        li.append(a)
        return li
      })
      const list = document.createElement('ul')
      list.append(...listElements)
      document.querySelector('body').append(list)
    })
  const roomNameInput = document.getElementById('roomName')
  roomNameInput.addEventListener('input', (ev) =>
    updateRoomLinks(ev.target.value)
  )
  suggestName()
  document
    .getElementById('suggestionButton')
    .addEventListener('click', () => suggestName())
  initPollLinksClipboard()
}
init()
