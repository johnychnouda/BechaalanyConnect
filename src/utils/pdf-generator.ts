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
            
            if (orderData.Customer?.business_location) {
                doc.text(`Business Location: ${orderData.Customer.business_location}`, 120, 90);
            }
            if (orderData.Customer?.business_name) {
                doc.text(`Business Name: ${orderData.Customer.business_name}`, 120, 100);
            }

            // Calculate the height needed for customer information
            let customerInfoHeight = 0;
            if (orderData.Customer?.username || orderData.Customer?.email || 
                orderData.Customer?.phone_number || orderData.Customer?.country || 
                orderData.Customer?.business_location || orderData.Customer?.business_name) {
                customerInfoHeight = 50; // Base height for customer info section
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
                startY: 120 , // Position table below customer info
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
            const tableEndY = (doc as any).lastAutoTable.finalY || (140 + customerInfoHeight);

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
        let customerCountry = '';
        let customerBusinessLocation = '';
        let customerBusinessName = '';

        // Check if user data is available in the order
        if (order?.Customer) {
            // User data is directly available in the order
            customerName = order.Customer.username || '';
            customerEmail = order.Customer.email || '';
            customerPhone = order.Customer.phone_number || '';
            customerCountry = order.Customer.country || '';
            customerBusinessLocation = order.Customer.business_location || '';
            customerBusinessName = order.Customer.business_name || '';
        } else if (order?.users_id) {
            // Fallback: if no user data, show user ID
            customerName = `User ID: ${order.users_id}`;
        }

        const receiptData: OrderReceiptData = {
            orderId: order.id,
            orderDate: order.date,
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
                country: customerCountry,
                business_location: customerBusinessLocation,
                business_name: customerBusinessName
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
