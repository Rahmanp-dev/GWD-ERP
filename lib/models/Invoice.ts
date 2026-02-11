import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvoice extends Document {
    invoiceNumber: string;
    deal?: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    client: {
        name: string;
        email?: string;
        address?: string;
    };
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    subtotal: number;
    tax: number;
    taxRate: number;
    discount: number;
    total: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
    dueDate: Date;
    paidAt?: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;

    // PDF Fields
    pdfTemplate?: string;
    termsAndConditions?: string;
    paymentTerms?: string;
    logoUrl?: string;
}

const InvoiceSchema = new Schema<IInvoice>({
    invoiceNumber: { type: String, required: true, unique: true },
    deal: { type: Schema.Types.ObjectId, ref: 'Lead' },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    client: {
        name: { type: String, required: true },
        email: { type: String },
        address: { type: String }
    },
    items: [{
        description: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
        default: 'Draft'
    },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // PDF Engine Fields
    pdfTemplate: { type: String, default: 'standard' },
    termsAndConditions: { type: String }, // Rich text HTML
    paymentTerms: {
        type: String,
        enum: ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60'],
        default: 'Due on Receipt'
    },
    logoUrl: { type: String }
}, { timestamps: true });

// Auto-generate invoice number if not set
InvoiceSchema.pre('save', async function (this: IInvoice) {
    if (!this.invoiceNumber) {
        const count = await mongoose.models.Invoice?.countDocuments() || 0;
        this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
    }
});

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
