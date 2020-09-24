const http = require('http')
const express = require('express')
const path = require('path')
const WebSocket = require('ws')


const publicDir = path.join(__dirname, 'pub')
const templatesDir = path.join(__dirname, 'templates')

const clients = []
const leads = [
  {
    id:0,
    state:'new',
    name:'new member',
    phone:'+391234567890',
  }
]
var leads_count = 1

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

app.get('/', (req, res) => {
  res.sendFile(path.join(templatesDir, 'client.html'))
})

app.get('/crm', (req, res) => {
  res.sendFile(path.join(templatesDir, 'crm.html'))
})

app.use(express.static(publicDir))

app.use('/api', express.json())

app.get('/api/leads', (req, res) => {
  res.send(leads)
})

app.post('/api/leads/new', (req, res) => {
  const new_lead = {
    id:leads_count++,
    state:"new",
    ...req.body
  }
  leads.push(new_lead)
  res.send({msg:'OK'})
  wss.clients.forEach(ws => {
    ws.send(JSON.stringify({
      msg:'LEAD',
      data:new_lead,
    }))
  })
})


wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    if (msg.startsWith('REM LEAD ')) {
      const rem_lead_id = msg.split(" ")[2]
      const rem_lead_idx = leads.findIndex(l=>l.id==rem_lead_id)
      if (rem_lead_idx>-1 && leads.splice(rem_lead_idx,1)){
        wss.clients.forEach(_ws=>{
          _ws.send(JSON.stringify({
            msg:'REM_LEAD',
            data:rem_lead_id
          }))
        })
      }
    } else if (msg.startsWith('APPROVE LEAD ')) {
      const lead_id = msg.split(' ')[2]
      const lead = leads.find(l=>l.id==lead_id)
      if (lead){
        lead.state = 'approved'
        wss.clients.forEach(_ws=>{
          _ws.send(JSON.stringify({
            msg:'APPROVE_LEAD',
            data:lead_id
          }))
        })
      }
    } else {
      switch(msg){
        case "GET LEADS":
          ws.send(JSON.stringify({
            msg:"LEADS",
            data:leads
          }))
          break
        default:
          console.log('ws msg', msg)
          ws.send('hello from ws')
      }
    }
  })
})

server.listen(3000)