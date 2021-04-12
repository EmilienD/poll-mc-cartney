export const createWebsocket = () => {
  const host = window.location.host
  const room = window.location.search.replace('?', '')
  return new WebSocket(`ws://${host}/pollrooms/${room}`)
}
export const initUserData = () => {
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
  userNameInput.addEventListener('input', (ev) =>
    localStorage.setItem('userName', ev.target.value)
  )
}

export const onUpdate = (ev) => {
  const parsedMessage = JSON.parse(ev.data)
  if (parsedMessage.type === 'update') {
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
      const td3 = document.createElement('td')
      td3.innerText = tableData[key].length
      tr.append(td1, td2, td3)
      return tr
    })
    const lastRow = document.createElement('tr')
    lastRow.innerHTML = `<tr><td></td><td></td><td>${parsedMessage.answers.length}</td></tr>`
    const answerTable = document.querySelector('#answerTable tbody')
    answerTable.innerHTML = ''
    answerTable.append(...rows, lastRow)
    document.querySelector('#question').innerText = parsedMessage.question
  }
}
