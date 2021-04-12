const host = window.location.host
const room = window.location.search.replace('?', '')
const ws = new WebSocket(`ws://${host}/pollrooms/${room}`)

let userId = localStorage.getItem('userId')
if (!userId) {
  userId = uuidv4()
  localStorage.setItem('userId', userId)
}
if (!localStorage.getItem('userName')) {
  const userName = prompt('What is your name?')
  localStorage.setItem('userName', userName)
}
const userNameInput = document.getElementById('userNameInput')
userNameInput.value = localStorage.getItem('userName')
userNameInput.addEventListener('change', (ev) =>
  localStorage.setItem('userName', ev.target.value)
)

ws.onopen = (ev) => {
  document.getElementById('answerForm').addEventListener('submit', (ev) => {
    ev.preventDefault()
    const answer = ev.target.querySelector('input[name=answer]').value
    const userName = localStorage.getItem('userName')
    ws.send(JSON.stringify({ type: 'setAnswer', answer, userId, userName }))
  })
  document.getElementById('questionForm').addEventListener('submit', (ev) => {
    ev.preventDefault()
    const question = ev.target.querySelector('input[name=question]').value
    const userName = localStorage.getItem('userName')
    ws.send(JSON.stringify({ type: 'setQuestion', question, userId, userName }))
  })
  ws.onmessage = (ev) => {
    const parsedMessage = JSON.parse(ev.data)
    switch (parsedMessage.type) {
      case 'update':
        const tableData = parsedMessage.answers.reduce((acc, val) => {
          if (!acc[val.answer]) {
            acc[val.answer] = []
          }
          acc[val.answer].push(val.userName)
          return acc
        }, {})
        const rows = Object.keys(tableData).map((key) => {
          const tr = document.createElement('tr')
          const td1 = document.createElement('td')
          td1.innerText = key
          const td2 = document.createElement('td')
          td2.innerText = tableData[key].join(', ')
          tr.append(td1, td2)
          return tr
        })
        document.querySelector('#answerTable tbody').append(...rows)
        document.querySelector('#question').innerText = parsedMessage.question
    }
  }
}
