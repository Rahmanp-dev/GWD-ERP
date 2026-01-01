import mongoose, { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    position: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Contact = models.Contact || model('Contact', ContactSchema);

export default Contact;
