const Page = require('./helpers/page')

let page

//
// Before tests
//
beforeEach( async () => {

	// Create browser tab
	page = await Page.build()

	// Go to app page
	await page.goto('http://localhost:3000')

})

//
// After tests
//
afterEach( async () => {

	// Cleanup browser
	await page.close()

})

//
// Check title
//
test("The geader has the correct test.", async () => {
	const text = await page.getContentsOf('a.brand-logo')
	expect(text).toEqual("Blogster")
})

//
// Test login
//
test("Clicking login starts OAUTH flow", async () => {
	await page.click('.right a')
	const url = await page.url()
	expect(url).toMatch(/accounts\.google\.com/)
})

//
// Test logout button presence
//
test("When signed in, show logout button", async () => {
	// Login
	await page.login()

	// Check that logout button is there
	const text = await page.getContentsOf('a[href="/auth/logout"]')
	expect(text).toEqual("Logout")
})
