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

    ws.addEventListener('message', (ev) => {
      const parsedMessage = JSON.parse(ev.data)

      if (parsedMessage.type === 'update') {
        const respondentsList = document.getElementById('respondents')
        respondentsList.innerHTML = ''
        respondentsList.append(
          ...parsedMessage.respondents.map(({ userName }) => {
            const li = document.createElement('li')
            li.innerText = userName
            return li
          })
        )
      }
      onUpdate(3)(ev)
    })
  })
}

initUserData()
initPollLink()
initWs()
