import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Cache to avoid re-fetching/registering the font per session
let amiriFontRegistered = false;

const AMIRI_FONT_FAMILY = 'Amiri';
const AMIRI_FONT_REGULAR_FILE = 'Amiri-Regular.ttf';
const AMIRI_FONT_BOLD_FILE = 'Amiri-Bold.ttf';
const AMIRI_FONT_REGULAR_PUBLIC_PATH = '/fonts/Amiri-Regular.ttf';
const AMIRI_FONT_BOLD_PUBLIC_PATH = '/fonts/Amiri-Bold.ttf';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // process in chunks to avoid call stack limits
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
}

async function ensureAmiriFont(doc: jsPDF): Promise<void> {
    if (amiriFontRegistered) return;
    const [resRegular, resBold] = await Promise.all([
        fetch(AMIRI_FONT_REGULAR_PUBLIC_PATH),
        fetch(AMIRI_FONT_BOLD_PUBLIC_PATH),
    ]);
    if (!resRegular.ok) throw new Error('Failed to load Amiri Regular font');
    if (!resBold.ok) throw new Error('Failed to load Amiri Bold font');
    const [abRegular, abBold] = await Promise.all([
        resRegular.arrayBuffer(),
        resBold.arrayBuffer(),
    ]);
    const base64Regular = arrayBufferToBase64(abRegular);
    const base64Bold = arrayBufferToBase64(abBold);
    (doc as any).addFileToVFS(AMIRI_FONT_REGULAR_FILE, base64Regular);
    (doc as any).addFileToVFS(AMIRI_FONT_BOLD_FILE, base64Bold);
    (doc as any).addFont(AMIRI_FONT_REGULAR_FILE, AMIRI_FONT_FAMILY, 'normal');
    (doc as any).addFont(AMIRI_FONT_BOLD_FILE, AMIRI_FONT_FAMILY, 'bold');
    amiriFontRegistered = true;
}

// Note: Avoid encoding transformations. jsPDF + Amiri can render Arabic directly.

export interface OrderReceiptData {
    orderId: number;
    orderDate: string;
    status: string;
    productName: string;
    productVariation: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    recipientInfo: string;
    Customer?: {
        username: string;
        email: string;
        phone_number: string;
        country?: string;
        business_location?: string;
        business_name?: string;
    }
}

export const generateOrderReceipt = async (orderData: OrderReceiptData, locale?: string): Promise<void> => {
    try {
        const doc = new jsPDF();

        // Register and use Amiri font for Arabic support
        await ensureAmiriFont(doc);
        doc.setFont(AMIRI_FONT_FAMILY, 'normal');
        const isArabic = locale === 'ar';

        // Set document properties
        doc.setProperties({
            title: `${locale === 'ar' ? 'إيصال الطلب' : 'Order Receipt'} #${orderData.orderId}`,
            subject: `${locale === 'ar' ? 'إيصال الطلب' : 'Order Receipt'}`,
            author: 'Bechaalany Connect',
            creator: 'Bechaalany Connect'
        });

        // Add company logo/header
        doc.setFontSize(24);
        doc.setTextColor(231, 56, 40); // #E73828
        doc.text('Bechaalany Connect', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${locale === 'ar' ? 'إيصال الطلب' : 'Order Receipt'}`, 105, 30, { align: 'center' });

        // Add receipt details
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Compute mirrored X positions for RTL
        const pageWidth = (doc as any).internal.pageSize.getWidth();
        const leftColX = 20;
        const rightColX = 120;
        const leftColX_AR = pageWidth - rightColX; // mirror of 120 from right
        const rightColX_AR = pageWidth - leftColX; // mirror of 20 from right

        // Left column (LTR) / Right column (RTL)
        if (!isArabic) {
            doc.text(`${locale === 'ar' ? 'تفاصيل الإيصال' : 'Receipt Details'}:`, leftColX, 50);
            doc.text(`${locale === 'ar' ? 'رقم الطلب' : 'Order ID'}: #${orderData.orderId}`, leftColX, 60);
            doc.text(`${locale === 'ar' ? 'التاريخ' : 'Date'}: ${orderData.orderDate}`, leftColX, 70);
            doc.text(`${locale === 'ar' ? 'الحالة' : 'Status'}: ${orderData.status}`, leftColX, 80);
        } else {
            doc.text(`:${'تفاصيل الإيصال'}`, rightColX_AR, 50, { align: 'right' });
            doc.text(`${'رقم الطلب'}: #${orderData.orderId}`, rightColX_AR, 60, { align: 'right' });
            doc.text(`${'التاريخ'}: ${orderData.orderDate}`, rightColX_AR, 70, { align: 'right' });
            doc.text(`${orderData.status} :${'الحالة'} `, rightColX_AR, 80, { align: 'right' });
        }

        // Right column (LTR) / Left column (RTL) - Customer Information
        if (!isArabic) {
            doc.text(`${locale === 'ar' ? 'معلومات العميل' : 'Customer Information'}:`, rightColX, 50);
            if (orderData.Customer?.username) {
                doc.text(`${locale === 'ar' ? 'الاسم' : 'Name'}: ${orderData.Customer.username}`, rightColX, 60);
            }
            if (orderData.Customer?.email) {
                doc.text(`${locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}: ${orderData.Customer.email}`, rightColX, 70);
            }
            if (orderData.Customer?.phone_number) {
                doc.text(`${locale === 'ar' ? 'الهاتف' : 'Phone'}: ${orderData.Customer.phone_number}`, rightColX, 80);
            }
        } else {
            doc.text(`:${'معلومات العميل'}`, leftColX_AR, 50, { align: 'right' });
            if (orderData.Customer?.username) {
                doc.text(`${'الاسم'}: ${orderData.Customer.username}`, leftColX_AR, 60, { align: 'right' });
            }
            if (orderData.Customer?.email) {
                doc.text(`${orderData.Customer.email} :${'البريد الإلكتروني'} `, leftColX_AR, 70, { align: 'right' });
            }
            if (orderData.Customer?.phone_number) {
                doc.text(`${'الهاتف'}: ${orderData.Customer.phone_number}`, leftColX_AR, 80, { align: 'right' });
            }
        }
            
        // Product details table - positioned below customer info
        const rawRows: [string, string][] = [
            [`${isArabic ? 'المنتج' : 'Product'}`, orderData.productName],
            [`${isArabic ? 'النوع' : 'Variation'}`, orderData.productVariation],
            [`${isArabic ? 'الكمية' : 'Quantity'}`, orderData.quantity.toString()],
            [`${isArabic ? 'معلومات المستلم' : 'Recipient Information'}`, orderData.recipientInfo],
            [`${isArabic ? 'سعر الوحدة' : 'Unit Price'}`, `$${orderData.unitPrice.toFixed(2)}`],
            [`${isArabic ? 'السعر الإجمالي' : 'Total Price'}`, `$${orderData.totalPrice.toFixed(2)}`]
        ];
        const tableData = isArabic
            ? rawRows.map(([label, value]) => [value, label]) // reverse columns for RTL: Details | Item
            : rawRows; // Item | Details

        const pageWidthTable = (doc as any).internal.pageSize.getWidth();
        const rightMargin = 20;
        const labelColWidth = 40;
        const valueColWidth = 80;
        const totalTableWidth = labelColWidth + valueColWidth;

        autoTable(doc, {
            startY: 100 , // Position table below customer info
            head: [
                isArabic
                    ? [`${'التفاصيل'}`, `${'العنصر'}`] // reverse order for RTL
                    : [`${'Item'}`, `${'Details'}`]
            ],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [231, 56, 40], // #E73828
                textColor: 255,
                fontStyle: 'bold',
                font: AMIRI_FONT_FAMILY,
                halign: (isArabic ? 'right' : 'left') as any,
            },
            styles: {
                fontSize: 10,
                cellPadding: 5,
                font: AMIRI_FONT_FAMILY,
                halign: (isArabic ? 'right' : 'left') as any,
            },
            didParseCell: (data: any) => {
                if (isArabic) {
                    data.cell.styles.font = AMIRI_FONT_FAMILY;
                    data.cell.styles.halign = 'right';
                }
            },
            columnStyles: {
                // For RTL, first column is Details (wider), second is Item (narrow)
                0: { fontStyle: isArabic ? 'normal' : 'bold', cellWidth: isArabic ? valueColWidth : labelColWidth },
                1: { cellWidth: isArabic ? labelColWidth : valueColWidth }
            },
            tableWidth: totalTableWidth,
            margin: isArabic
                ? { left: pageWidthTable - rightMargin - totalTableWidth, right: rightMargin }
                : { left: 20, right: 20 }
        });

        // Get the table's end position to avoid overlap
        const tableEndY = (doc as any).lastAutoTable.finalY || (140);

        // Footer - positioned below the table with proper spacing
        const footerY = tableEndY + 20; // Add 20px spacing after table

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`${locale === 'ar' ? 'شكراً لشرائكم!' : 'Thank you for your purchase!'}`, 105, footerY, { align: 'center' });
        doc.text(`${locale === 'ar' ? 'للدعم، تواصل مع فريق خدمة العملاء.' : 'For support, contact our customer service team.'}`, 105, footerY + 5, { align: 'center' });

        // Generate filename
        const filename = `order-receipt-${orderData.orderId}-${new Date().toISOString().split('T')[0]}.pdf`;

        // Save the PDF
        doc.save(filename);
    } catch (error) {
        throw error;
    }
};

export const generateOrderReceiptFromProcessedOrder = async (
    order: any,
    locale?: string
): Promise<void> => {
    try {
        // Extract unit price from total price and quantity
        const totalPrice = parseFloat(order.value.replace('$', ''));
        const unitPrice = totalPrice / order.quantity;

        // Extract customer information from the original order
        let customerName = '';
        let customerEmail = '';
        let customerPhone = '';

        // Check if user data is available in the order
        if (order?.Customer) {
            // User data is directly available in the order
            customerName = order.Customer.username || '';
            customerEmail = order.Customer.email || '';
            customerPhone = order.Customer.phone_number || '';
        } else if (order?.users_id) {
            // Fallback: if no user data, show user ID
            customerName = `${locale === 'ar' ? 'رقم المستخدم' : 'User ID'}: ${order.users_id}`;
        }

        const receiptData: OrderReceiptData = {
            orderId: order.id,
            orderDate: order.date.split('T')[0],
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            productName: order.title.split(' | ')[0] || `${locale === 'ar' ? 'منتج غير معروف' : 'Unknown Product'}`,
            productVariation: order.title.split(' | ')[1] || `${locale === 'ar' ? 'التغيير' : 'Standard'}`,
            quantity: order.quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            recipientInfo: order.recipient_info,
            Customer: {
                username: customerName,
                email: customerEmail,
                phone_number: customerPhone,
            }
        };

        await generateOrderReceipt(receiptData, locale);
    } catch (error) {
        console.error('Error generating PDF receipt:', error);
        throw error;
    }
};

export const generateBulkOrderReceipts = async (orders: any[]): Promise<void> => {
    try {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            // Add a small delay to prevent browser from blocking multiple downloads
            await new Promise(resolve => setTimeout(resolve, i * 200));
            await generateOrderReceiptFromProcessedOrder(order, (order?.locale || undefined));
        }
    } catch (error) {
        console.error('Error generating bulk PDF receipts:', error);
        throw error;
    }
};
