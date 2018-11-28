"use strict"

const elements = getElementsArrayById([
  "connectNormal",
  "otherPeerId",
  "connectToSession",
  "connectToSessionForm",
  "input",
  "output",
  "idMessage",
  "idValue",
  "idCopy",
  "yourVideo",
  "otherVideo",
  "errorOverlay",
  "errorMessage"
])

const showError = message => {
  show(elements["errorOverlay"])
  elements["errorOverlay"].classList.add("fade-in")
  elements["errorOverlay"].textContent = message
}

/**
 * Onload. Setup the page interactions
 */
window.onload = () => {
  elements["connectNormal"].onclick = event => {
    event.preventDefault()
    startDwrtc(false)
    hide(elements["idMessage"])
  }
  elements["connectToSession"].onclick = event => {
    if (elements["connectToSessionForm"].checkValidity()) {
      // Allow HTML5 form validation to take place
      event.preventDefault()
      startDwrtc(true, elements["otherPeerId"].value)
      hide(elements["idMessage"])
    }
  }
  elements["idCopy"].onclick = copyIdToClipboard
  show(elements["input"])
}

const copyIdToClipboard = event => {
  event.preventDefault()
  elements["idValue"].select()
  document.execCommand("copy")
  elements["idCopy"].textContent = "Copied!"
}

/**
 * Called when the user is ready. Sets up DWRTC.
 */
async function startDwrtc(initiator, initialPeerId) {
  const wsProtocol = location.protocol === "https:" ? "wss" : "ws" // in a perfect world, it's always wss
  const webSocketUrl = `${wsProtocol}://${location.host}/ws`

  console.log("Start DWRTC")
  hide(elements["input"])
  show(elements["output"])
  elements["output"].classList.add("grid")
  const dwrtc = new DWRTC(initiator, initialPeerId, webSocketUrl)

  dwrtc.on("started", stream => {
    elements["yourVideo"].srcObject = stream
    elements["yourVideo"].muted = true
    elements["yourVideo"].play()
    show(elements["idMessage"])
  })

  dwrtc.on("stream", stream => {
    console.log("got  stream")
    hide(elements["idMessage"])
    elements["otherVideo"].srcObject = stream
    elements["otherVideo"].play()
    show(elements["otherVideo"])
  })

  dwrtc.on("id", id => {
    console.debug(`ID: ${id}`)
    elements["idValue"].value = id
  })

  dwrtc.on("webSocketError", message => {
    const error = message.error
    console.error(error)
    const errorSuffix =
      "Kindly reload the page and try again with another input"
    showError(`${error}. ${errorSuffix}.`)
  })

  dwrtc.on("error", message => {
    console.error(message)
    showError(message)
  })

  await dwrtc.setup()
}
