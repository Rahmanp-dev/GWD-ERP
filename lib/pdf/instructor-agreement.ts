import puppeteer from 'puppeteer';
import { format } from 'date-fns';

export async function generateInstructorAgreement(instructor: any, terms: any) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
             body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .meta { margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; text-transform: uppercase; font-size: 14px; border-bottom: 1px solid #ccc; margin-bottom: 10px; }
            .footer { margin-top: 50px; font-size: 12px; text-align: center; color: #666; }
            .signature-box { margin-top: 60px; display: flex; justify-content: space-between; }
            .sign-line { border-top: 1px solid #000; width: 220px; padding-top: 10px; margin-top: 50px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">Faculty Engagement Agreement</div>
            <p>GWD Academy | Global Workforce Development</p>
        </div>

        <div class="meta">
            <p><strong>Effective Date:</strong> ${format(new Date(), 'MMMM dd, yyyy')}</p>
            <p><strong>Faculty Member:</strong> ${instructor.user?.name}</p>
            <p><strong>Engagement Type:</strong> ${terms.type || 'Revenue Share Model'}</p>
        </div>

        <div class="section">
            <div class="section-title">1. Purpose</div>
            <p>GWD Academy engages the Faculty Member to provide instruction, mentorship, and curriculum development services for the Academy's programs.</p>
        </div>

        <div class="section">
            <div class="section-title">2. Scope of Services</div>
            <p>The Faculty Member agrees to:</p>
            <ul>
                <li>Deliver live sessions and lectures as scheduled.</li>
                <li>Develop and update course materials and syllabus.</li>
                <li>Mentor students and grade capstone projects.</li>
                <li>Maintain a minimum satisfaction rating of 4.0/5.0.</li>
            </ul>
        </div>

        <div class="section">
            <div class="section-title">3. Compensation</div>
            ${terms.type === 'Revenue Share' ?
            `<p><strong>Revenue Share:</strong> The Faculty Member shall receive <strong>${terms.sharePercentage}%</strong> of the Net Revenue generated from cohorts assigned to them.</p>
                 <p>"Net Revenue" is defined as Gross Student Fees minus refunds, taxes, and platform costs.</p>`
            :
            `<p><strong>Fixed Fee:</strong> The Faculty Member shall be paid <strong>$${terms.fixedRate}</strong> per cohort/month.</p>`
        }
        </div>

        <div class="section">
            <div class="section-title">4. Intellectual Property</div>
            <p>All curriculum, course materials, and recordings created during this engagement shall be the exclusive property of GWD Academy, unless otherwise agreed in writing.</p>
        </div>

        <div class="section">
            <div class="section-title">5. Non-Solicitation</div>
            <p>The Faculty Member agrees not to solicit GWD Academy students for private consulting or competing courses for a period of 12 months.</p>
        </div>

        <div class="signature-box">
             <div>
                <p><strong>GWD Academy Representative</strong></p>
                <div class="sign-line">Signature</div>
                <p>Date: _______________</p>
            </div>
             <div>
                <p><strong>Faculty Member</strong></p>
                <div class="sign-line">Signature</div>
                <p>Date: _______________</p>
            </div>
        </div>

        <div class="footer">
            CONFIDENTIAL • GWD Academy Faculty Agreement • ${new Date().getFullYear()}
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdf;
}
