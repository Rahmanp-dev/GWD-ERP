import mongoose, { Schema, model, models } from 'mongoose';

const CompanySchema = new Schema({
    name: { type: String, required: true },
    industry: { type: String },
    website: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Company = models.Company || model('Company', CompanySchema);

export default Company;
