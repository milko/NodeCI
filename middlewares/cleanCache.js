const { clearHash } = require('../services/cache')

module.exports = async (req, res, next) => {
	// Make this middleware run after handler
	await next()

	clearHash(req.user.id)
}