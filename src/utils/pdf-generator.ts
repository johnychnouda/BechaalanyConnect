import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const generateOrderReceipt = (orderData: OrderReceiptData): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF();

            // Set document properties
            doc.setProperties({
                title: `Order Receipt #${orderData.orderId}`,
                subject: 'Order Receipt',
                author: 'Bechaalany Connect',
                creator: 'Bechaalany Connect'
            });

            // Add company logo/header
            doc.setFontSize(24);
            doc.setTextColor(231, 56, 40); // #E73828
            doc.text('Bechaalany Connect', 105, 20, { align: 'center' });

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text('Order Receipt', 105, 30, { align: 'center' });

            // Add receipt details
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            // Left column
            doc.text('Receipt Details:', 20, 50);
            doc.text(`Order ID: #${orderData.orderId}`, 20, 60);
            doc.text(`Date: ${orderData.orderDate}`, 20, 70);
            doc.text(`Status: ${orderData.status}`, 20, 80);

            // Right column - Customer Information in 2 columns per row
            doc.text('Customer Information:', 120, 50);
            
            // Row 1: Name and Email
            if (orderData.Customer?.username) {
                doc.text(`Name: ${orderData.Customer.username}`, 120, 60);
            }
            if (orderData.Customer?.email) {
                doc.text(`Email: ${orderData.Customer.email}`, 120, 70);
            }
        
            if (orderData.Customer?.phone_number) {
                doc.text(`Phone: ${orderData.Customer.phone_number}`, 120, 80);
            }
            
            // Product details table - positioned below customer info
            const tableData = [
                ['Product', orderData.productName],
                ['Variation', orderData.productVariation],
                ['Quantity', orderData.quantity.toString()],
                ['Recipient Information', orderData.recipientInfo],
                ['Unit Price', `$${orderData.unitPrice.toFixed(2)}`],
                ['Total Price', `$${orderData.totalPrice.toFixed(2)}`]
            ];

            autoTable(doc, {
                startY: 100 , // Position table below customer info
                head: [['Item', 'Details']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [231, 56, 40], // #E73828
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 40 },
                    1: { cellWidth: 80 }
                }
            });

            // Get the table's end position to avoid overlap
            const tableEndY = (doc as any).lastAutoTable.finalY || (140);

            // Footer - positioned below the table with proper spacing
            const footerY = tableEndY + 20; // Add 20px spacing after table

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('Thank you for your purchase!', 105, footerY, { align: 'center' });
            doc.text('For support, contact our customer service team.', 105, footerY + 5, { align: 'center' });

            // Generate filename
            const filename = `order-receipt-${orderData.orderId}-${new Date().toISOString().split('T')[0]}.pdf`;

            // Save the PDF
            doc.save(filename);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const generateOrderReceiptFromProcessedOrder = async (
    order: any
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
            customerName = `User ID: ${order.users_id}`;
        }

        const receiptData: OrderReceiptData = {
            orderId: order.id,
            orderDate: order.date.split('T')[0],
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            productName: order.title.split(' | ')[0] || 'Unknown Product',
            productVariation: order.title.split(' | ')[1] || 'Standard',
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

        await generateOrderReceipt(receiptData);
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
            await generateOrderReceiptFromProcessedOrder(order);
        }
    } catch (error) {
        console.error('Error generating bulk PDF receipts:', error);
        throw error;
    }
};
