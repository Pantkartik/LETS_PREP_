import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
    input: string;
    expected_output: string;
    is_hidden: boolean;
}

export interface IQuestion extends Document {
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    sample_input: string;
    sample_output: string;
    test_cases: ITestCase[];
    createdAt: Date;
    updatedAt: Date;
}

const TestCaseSchema = new Schema({
    input: { type: String, required: true },
    expected_output: { type: String, required: true },
    is_hidden: { type: Boolean, default: false }
});

const QuestionSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    sample_input: { type: String, required: true },
    sample_output: { type: String, required: true },
    test_cases: [TestCaseSchema]
}, { timestamps: true });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
