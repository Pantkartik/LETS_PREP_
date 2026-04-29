const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    sample_input: { type: String, required: true },
    sample_output: { type: String, required: true },
    test_cases: [{
        input: { type: String, required: true },
        expected_output: { type: String, required: true },
        is_hidden: { type: Boolean, default: false }
    }]
}, { timestamps: true });

const Question = mongoose.model('Question', QuestionSchema);

async function seed() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lets_prep_judge');
        console.log('Connected to MongoDB');

        await Question.deleteMany({});

        const questions = [
            {
                title: "Two Sum",
                description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                difficulty: "Easy",
                sample_input: "[2,7,11,15], 9",
                sample_output: "[0,1]",
                test_cases: [
                    { input: "2 7 11 15\n9", expected_output: "0 1", is_hidden: false },
                    { input: "3 2 4\n6", expected_output: "1 2", is_hidden: true }
                ]
            },
            {
                title: "Reverse Integer",
                description: "Given a signed 32-bit integer x, return x with its digits reversed.",
                difficulty: "Medium",
                sample_input: "123",
                sample_output: "321",
                test_cases: [
                    { input: "123", expected_output: "321", is_hidden: false },
                    { input: "-123", expected_output: "-321", is_hidden: true }
                ]
            }
        ];

        await Question.insertMany(questions);
        console.log('Seed successful');
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
