const Page = require('./helpers/page')

// Page global
let page

// Content globals.
const confirmationTitle = "Please confirm your entries"
const inputTitle = { selector: '.title input', value: "My Title" }
const inputContent = { selector: '.content input', value: "My Content" }

// Execute before each test
beforeEach(async () => {

    // Create page
    page = await Page.build()

    // Go to application main page
    await page.goto('http://localhost:3000')
})

// After each test
afterEach(async () => {

    // Close page
    await page.close()

})

// Ensure user is logged in
describe("When user is logged in", async () => {

    // Login and add new blog
    beforeEach(async () => {
        await page.login()
        await page.click('a.btn-floating')
    })

    // Check blog creation form
    test("can see blog create form", async () => {

        // Check blog title label in form
        const label = await page.getContentsOf('form label')

        // Test
        expect(label).toEqual("Blog Title")

    })

    // Check valid input
    describe("And using valid inputs", async () => {

        // Fill valid input and submit
        beforeEach(async () => {

            // Fill content
            await page.type(inputTitle.selector, inputTitle.value)
            await page.type(inputContent.selector, inputContent.value)

            // Submit form
            await page.click('form button')
        })

        // Check if submit gets to review screen
        test("Submitting takes user to review screen", async () => {

            // Ensure confirmation title
            const text = await page.getContentsOf('h5')
            expect(text).toEqual(confirmationTitle)

        })

        // Check that new blog gets saved
        test("Submitting then saving adds blog to index page", async () => {

            // Click confirmaton button
            await page.click('button.green')

            // Wait for blogs page to appear
            await page.waitFor('.card')

            // Test
            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')
            expect(title).toEqual(inputTitle.value)
            expect(content).toEqual(inputContent.value)
            
        })
    })

    // Check invalid input
    describe("And using invalid inputs", async () => {

        // Set invalid input
        beforeEach(async () => {

            // Submit form before filling content
            await page.click('form button')

        })

        // Ensure an error is posted
        test("The form shows an error message", async () => {

            // Pull error texts
            const titleError = await page.getContentsOf('.title .red-text')
            const contsntError = await page.getContentsOf('.content .red-text')

            // Test
            expect(titleError).toEqual("You must provide a value")
            expect(contsntError).toEqual("You must provide a value")

        })
    })
})

// Handle user not logged in
describe("When user is not logged in", async () => {

    // Requests list
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: "My Title",
                content: "My Content"
            }
        }
    ]

    // Expected result
    const errorResult = {
        error: 'You must log in!'
    }

    // Require user to be logged in for blog creation and retrieval
    test("Blog related actions are prohibited", async () => {

        // Iterate actions
        const results = await page.execRequests(actions)

        // Test
        for(let result of results) {
            expect(result).toEqual(errorResult)
        }

    })
})
