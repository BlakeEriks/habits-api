const axios = require('axios')
const readline = require('readline')

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Function to send message
async function sendMessage(number, text) {
  try {
    const response = await axios.post('http://localhost:8000/api', {
      number,
      text,
    })

    // Print the server response
    console.log(response.data)
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message)
  }
}

// Function to ask user for input
function askForInput() {
  let number = '17577715354'
  rl.question('Input: ', text => {
    sendMessage(number, text).then(() => {
      askForInput() // Prompt again after sending the message
    })
  })
}

// Start the input loop
askForInput()
