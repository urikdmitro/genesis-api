const express = require('express')
const path = require('path')
const fs = require('fs')
const util = require('util')
const nodemailer = require('nodemailer')
require('dotenv').config()

const app = express()
const PORT = 4000
const EMAILS_BASE = 'emailsBase.txt'

app.use(express.static(path.resolve(__dirname, 'client')))
app.use(express.json())



// Налаштування nodemailer
const transporter = nodemailer.createTransport(
{
	host: '',
    port: 587,
    secureConnection: false,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
},
{
	from: 'Genesis <' + process.env.EMAIL + '>'
})



async function subscribeEmail(email) {
	// Читаємо файл з скриньками
	let subscribedEmails = await fs.promises.readFile(EMAILS_BASE, 'utf-8')
	subscribedEmails = subscribedEmails.split('\n')

	
	if(subscribedEmails.includes(email)) {
		return false
	}
	else {
		await fs.promises.appendFile(EMAILS_BASE, email + '\n')
		return true
	}
}



// Отримуємо актуальний курс біткоїну з сервісу nomics
const key = '970955e37f5b43d6db46020acc6655b8dab3f78a' 
const btcToUahUrl = `https://api.nomics.com/v1/currencies/ticker?key=${key}&ids=BTC&convert=UAH`

async function getBtcToUah() {
	let response = await fetch(btcToUahUrl)

	if(response.ok) {
		let json = await response.json()
		return {'data' : parseFloat(json[0].price), 'status' : 200}
	}
	else return {'data' : 'Invalid status value', 'status' : 400}
}





// /rate
app.get('/rate', async (req, res) => {
	let response = await getBtcToUah()
	res.status(response.status).json(response.data)
})


// /subscribe
app.post('/subscribe', async (req, res) => {

	if(await subscribeEmail(req.body.email)) 
		res.status(200).json({description : 'E-mail додано'})
	else 
	 	res.status(409).json({description: "E-mail вже є в базі даних"})
})


// /sendEmails
app.post('/sendEmails', async (req, res) => {
	// читаємо електронні скриньки з файлу
	let subscribedEmails = await fs.promises.readFile(EMAILS_BASE, 'utf-8')
	subscribedEmails = subscribedEmails.split('\n')

	for(const email of subscribedEmails) {
		await transporter.sendMail({
			to: email,
			subject: 'Актуальний курс біткоiну від Genesis education',
			text: `1 BTC = ${ getBtcToUah() } UAH`
		})

		console.log("Mail has been sented to " + email)
	}


	res.status(200).json({description: "E-mailʼи відправлено"})
})




app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'index.html')))

app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`))
