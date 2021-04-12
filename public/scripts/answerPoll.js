import { initUserData, createWebsocket, onUpdate } from './common.js'
const ws = createWebsocket()
initUserData()

ws.addEventListener('open', (ev) => {
  document.getElementById('answerForm').addEventListener('submit', (ev) => {
    ev.preventDefault()
    const answer = ev.target.querySelector('input[name=answer]').value
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    ws.send(JSON.stringify({ type: 'setAnswer', answer, userId, userName }))
  })

  ws.addEventListener('message', onUpdate)
})
