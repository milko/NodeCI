//
// Requires
//
const mongoose = require('mongoose')
const redis = require('redis')
const util = require('util')
const keys = require('../config/keys')

//
// Configure Redis
//
const client = redis.createClient(keys.redisUrl)

//
// Make client.get() method a promise
//
client.hget = util.promisify(client.hget)

//
// Save original Query.exec() method.
//
const exec = mongoose.Query.prototype.exec

//
// Set cache flag chainable function
//
mongoose.Query.prototype.cache = function (options = {}) {
	this.useCache = true
	this.hashKey = JSON.stringify(options.key || '')

    return this
}

//
// Query.exec() implementation.
//
mongoose.Query.prototype.exec = async function () {
    //
    // Handle no cache
    //
    if(! this.useCache) {
        return exec.apply(this, arguments)
    }

    //
    // Create query key
    //
    const query = {}
    query[this.mongooseCollection.name] = this.getQuery()
    const key = JSON.stringify(query)

    //
    // Check key in cache
    //
    const cacheValue = await client.hget(this.hashKey, key)
    if(cacheValue) {
        // Unserialise value
        const doc =  JSON.parse(cacheValue)

        // Convert objects to models
        return Array.isArray(doc)
            ? doc.map(d => new this.model(d))
            : new this.model(doc)
    }

    //
    // Call original Query.exec()
    //
    const result = await exec.apply(this, arguments)

    //
    // Save in cache
    //
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)

    return result
}

module.exports = {
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey))
	}
}
