import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    question_id: mongoose.Types.ObjectId;
    user_id: string; // From auth
    code: string;
    language_id: number;
    status: string;
    execution_time: number;
    memory_usage: number;
    verdict: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded' | 'Pending';
    error_message?: string;
    createdAt: Date;
}

const SubmissionSchema: Schema = new Schema({
    question_id: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    user_id: { type: String, required: true },
    code: { type: String, required: true },
    language_id: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    execution_time: { type: Number },
    memory_usage: { type: Number },
    verdict: { 
        type: String, 
        enum: ['Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded', 'Pending'],
        default: 'Pending'
    },
    error_message: { type: String }
}, { timestamps: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
