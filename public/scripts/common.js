export const createWebsocket = () => {
  const { host, protocol, search } = window.location
  const room = search.replace('?', '')
  return new WebSocket(
    `${protocol === 'https:' ? 'wss' : 'ws'}://${host}/pollrooms/${room}`
  )
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

export const initPollLinksClipboard = () => {
  Array.from(document.querySelectorAll('.pollLinks button')).forEach((button) =>
    button.addEventListener('click', (ev) => {
      navigator.clipboard.writeText(
        ev.target.parentElement.querySelector('a').href
      )
    })
  )
}

const renderAnswer = (val, highlight) => {
  const code = document.createElement('code')
  code.innerText = val
  if (highlight) {
    code.classList.add(`language-${highlight}`)
    Prism.highlightElement(code)
  }
  const pre = document.createElement('pre')
  pre.append(code)
  return pre
}

export const onUpdate = (numberOfCols = 1) => (ev) => {
  const parsedMessage = JSON.parse(ev.data)
  if (parsedMessage.type === 'update') {
    const tableData = parsedMessage.answers.reduce((acc, val) => {
      const storedAnswer = acc.get(val.answer)
      if (!storedAnswer) {
        acc.set(val.answer, {
          userNames: [],
          highlight: val.highlight,
          answer: val.answer,
        })
      } else if (!storedAnswer.highlight) {
        storedAnswer.highlight = val.highlight
      }
      acc.get(val.answer).userNames.push(val.userName)
      return acc
    }, new Map())
    const rows = Array.from(tableData.values()).map((item) => {
      const tr = document.createElement('tr')
      const data = [
        [item.answer, item.highlight],
        item.userNames.join(', '),
        item.userNames.length,
      ]
      const tds = data.slice(0, numberOfCols).map((val, i) => {
        const td = document.createElement('td')
        if (i === 0) {
          td.append(renderAnswer(...val))
        } else {
          td.innerText = val
        }
        return td
      })
      tr.append(...tds)
      return tr
    })
    const lastRow = document.createElement('tr')
    lastRow.innerHTML = `${new Array(numberOfCols - 1)
      .fill('<td></td>')
      .join('')}<td>${parsedMessage.answers.length}</td>`
    const answerTable = document.querySelector('#answerTable tbody')
    answerTable.innerHTML = ''
    answerTable.append(...rows, lastRow)
    document.querySelector('#question').innerText = parsedMessage.question
  }
}

export const makeRoomLink = (file) => (roomName) => {
  const { origin } = window.location
  return `${origin}/${file}?${roomName}`
}
