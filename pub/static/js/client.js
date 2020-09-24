function post(url, data) {
  return new Promise((done, fail) => {
    const r = new XMLHttpRequest()
    r.open("POST", url, true)
    r.responseType = "json"
    // r.setRequestHeader("X-CSRFToken", getCookie("csrftoken"))
    r.setRequestHeader("Content-Type", "application/json")
    r.onload = () => done(r.response)
    r.onerror = fail
    r.send(JSON.stringify(data))
  })
}