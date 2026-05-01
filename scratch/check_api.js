
const fetch = require('node-fetch');

async function checkQuestions() {
    try {
        const response = await fetch('http://localhost:3001/api/v1/judge/questions');
        if (!response.ok) {
            console.error('Failed to fetch:', response.status, response.statusText);
            return;
        }
        const questions = await response.json();
        console.log('Fetched questions:', questions.length);
        if (questions.length > 0) {
            console.log('Sample question:', questions[0]);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkQuestions();
