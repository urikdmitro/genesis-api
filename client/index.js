async function request(url, method, data = null) {
	try{
		let headers = {}
		let body  

		if(data) {
			headers['Content-Type'] = 'application/json'
			body = JSON.stringify(data)	
		}
		
		let response = await fetch(url, {method, headers, body})

		return await response.json()
	}
	catch(exception) {
		console.error(exception.message)
	}
}


console.log(await request('/rate', 'GET'))

await request('/subscribe', 'POST', {email: 'urikdmitro@gmail.com'})

// await request('/sendEmails', 'POST')
