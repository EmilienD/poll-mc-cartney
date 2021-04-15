import { initUserData, createWebsocket, onUpdate } from './common.js'

initUserData()

const ws = createWebsocket()
ws.addEventListener('open', (ev) => {
  document.getElementById('answerForm').addEventListener('submit', (ev) => {
    ev.preventDefault()
    const answer = ev.target.querySelector('[name=answer]').value
    const highlight = ev.target.querySelector('[name=highlight]').value
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    ws.send(
      JSON.stringify({ type: 'setAnswer', answer, userId, userName, highlight })
    )
  })

  ws.addEventListener('message', onUpdate(1))
})
