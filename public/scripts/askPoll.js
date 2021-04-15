import {
  initUserData,
  createWebsocket,
  onUpdate,
  initPollLinksClipboard,
  makeRoomLink,
} from './common.js'

const initPollLink = () => {
  const { search } = window.location
  document
    .getElementById('answerLink')
    .setAttribute(
      'href',
      makeRoomLink('answerPoll.html')(search.replace('?', ''))
    )
  initPollLinksClipboard()
}

const initWs = () => {
  const ws = createWebsocket()
  ws.addEventListener('open', (ev) => {
    document.getElementById('questionForm').addEventListener('submit', (ev) => {
      ev.preventDefault()
      const question = ev.target.querySelector('input[name=question]').value
      const userId = localStorage.getItem('userId')
      const userName = localStorage.getItem('userName')
      ws.send(
        JSON.stringify({ type: 'setQuestion', question, userId, userName })
      )
    })

    ws.addEventListener('message', onUpdate(3))
  })
}

initUserData()
initPollLink()
initWs()
