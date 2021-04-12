import { initUserData, createWebsocket, onUpdate } from './common.js'
const ws = createWebsocket()
initUserData()

ws.addEventListener('open', (ev) => {
  document.getElementById('questionForm').addEventListener('submit', (ev) => {
    ev.preventDefault()
    const question = ev.target.querySelector('input[name=question]').value
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    ws.send(JSON.stringify({ type: 'setQuestion', question, userId, userName }))
  })

  ws.addEventListener('message', onUpdate)
})
