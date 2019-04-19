const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip')
const keys = require('../../config/keys')
const keygrip = new Keygrip([ keys.cookieKey ])

module.exports = user => {

    // Create base64 JSON string of passport object
	const sessionObject = { passport: { user: user._id.toString() } }
	const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64')

	// Sign json object
    const sig = keygrip.sign(`session=${session}`)
    
    // Return data
    return { session, sig }

}
