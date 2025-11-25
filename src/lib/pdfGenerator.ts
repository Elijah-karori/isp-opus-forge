import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
    invoice_number: string;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    customer_address?: string;
    project_name?: string;
    milestone_name: string;
    amount: string | number;
    amount_paid: string | number;
    due_date: string | null;
    created_date?: string;
}

export const generateInvoicePDF = (invoice: InvoiceData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Company Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('ISP ERP SYSTEM', 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Internet Service Provider', 15, 27);
    doc.text('Nairobi, Kenya', 15, 32);
    doc.text('Email: info@isp-erp.com', 15, 37);
    doc.text('Phone: +254 700 000 000', 15, 42);

    // Invoice Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 15, 20, { align: 'right' });

    // Invoice Number and Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.invoice_number}`, pageWidth - 15, 30, { align: 'right' });
    doc.text(`Date: ${invoice.created_date || new Date().toLocaleDateString()}`, pageWidth - 15, 35, { align: 'right' });
    if (invoice.due_date) {
        doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - 15, 40, { align: 'right' });
    }

    // Bill To Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 62;
    doc.text(invoice.customer_name || 'N/A', 15, yPos);

    if (invoice.customer_email) {
        yPos += 5;
        doc.text(invoice.customer_email, 15, yPos);
    }

    if (invoice.customer_phone) {
        yPos += 5;
        doc.text(invoice.customer_phone, 15, yPos);
    }

    if (invoice.customer_address) {
        yPos += 5;
        doc.text(invoice.customer_address, 15, yPos);
    }

    // Line Items Table
    const tableStartY = Math.max(yPos + 15, 85);

    autoTable(doc, {
        startY: tableStartY,
        head: [['Description', 'Amount']],
        body: [
            [
                invoice.milestone_name || 'Service',
                `KES ${parseFloat(invoice.amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ]
        ],
        theme: 'striped',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10
        }
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 70;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text('Subtotal:', summaryX, finalY);
    doc.text(
        `KES ${parseFloat(invoice.amount.toString()).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - 15,
        finalY,
        { align: 'right' }
    );

    // Amount Paid
    const amountPaid = parseFloat(invoice.amount_paid.toString());
    if (amountPaid > 0) {
        doc.text('Amount Paid:', summaryX, finalY + 7);
        doc.text(
            `KES ${amountPaid.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            pageWidth - 15,
            finalY + 7,
            { align: 'right' }
        );
    }

    // Total/Balance Due
    const balance = parseFloat(invoice.amount.toString()) - amountPaid;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const balanceY = amountPaid > 0 ? finalY + 14 : finalY + 7;
    doc.text(amountPaid > 0 ? 'Balance Due:' : 'Total:', summaryX, balanceY);
    doc.text(
        `KES ${balance.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        pageWidth - 15,
        balanceY,
        { align: 'right' }
    );

    // Payment Instructions
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INSTRUCTIONS:', 15, balanceY + 20);

    doc.setFont('helvetica', 'normal');
    doc.text('Bank: ABC Bank Kenya', 15, balanceY + 27);
    doc.text('Account Name: ISP ERP System Ltd', 15, balanceY + 32);
    doc.text('Account Number: 1234567890', 15, balanceY + 37);
    doc.text('MPESA Paybill: 123456', 15, balanceY + 42);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('For any questions, please contact us at info@isp-erp.com', pageWidth / 2, footerY + 5, { align: 'center' });

    return doc;
};

export const downloadInvoicePDF = (invoice: InvoiceData) => {
    const doc = generateInvoicePDF(invoice);
    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};

export const previewInvoicePDF = (invoice: InvoiceData) => {
    const doc = generateInvoicePDF(invoice);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
};
