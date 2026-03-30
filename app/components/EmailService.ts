// Email configuration for Formspree
// Sign up at https://formspree.io and create forms to get your form IDs
// Replace these with your actual Formspree form IDs

/**
 * FORMSPREE SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://formspree.io and create an account
 * 2. Create three forms (Order, Contact, Newsletter)
 * 3. Add jacebotai@gmail.com as a notification email for each form
 * 4. Copy the form IDs from the form URLs and paste them below
 * 
 * Example: If your form URL is https://formspree.io/f/maqdlrrl
 *          Your form ID is: maqdlrrl
 * 
 * VERIFICATION CHECKLIST:
 * ✅ Order Form ID: maqdlrrl (configured)
 * ✅ Contact Form ID: xqedgrrw (configured)
 * ✅ Newsletter Form ID: xlgwoqqz (configured)
 * ✅ Admin Email: jacebotai@gmail.com (configured)
 * 
 * IMPORTANT: Make sure to verify your email in Formspree dashboard
 * to start receiving notifications.
 */

export const FORMSPREE_CONFIG = {
  // Form IDs from Formspree - configured to send to jacebotai@gmail.com
  // Use env vars if available, fallback to hardcoded values
  orderFormId: process.env.NEXT_PUBLIC_FORMSPREE_ORDER_FORM_ID || "maqdlrrl",
  contactFormId: process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_FORM_ID || "xqedgrrw",
  newsletterFormId: process.env.NEXT_PUBLIC_FORMSPREE_NEWSLETTER_FORM_ID || "xlgwoqqz",
  
  // Your email where notifications will be sent
  adminEmail: "jacebotai@gmail.com",
};

// Check if Formspree is properly configured
export const isFormspreeConfigured = 
  FORMSPREE_CONFIG.orderFormId !== "YOUR_ORDER_FORM_ID" &&
  FORMSPREE_CONFIG.orderFormId !== "" &&
  !FORMSPREE_CONFIG.orderFormId.includes("your");

// Helper to format order details for email
export function formatOrderEmail(orderData: {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    pickupDate: string;
    pickupTime: string;
    specialInstructions?: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
      unit: string;
      emoji: string;
    };
    quantity: number;
  }>;
  total: number;
  orderNumber: string;
  orderDate: string;
}) {
  const itemsList = orderData.items
    .map(
      (item) =>
        `  • ${item.product.emoji} ${item.product.name} - ${item.quantity} × $${item.product.price.toFixed(2)} = $${(
          item.product.price * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  return {
    subject: `New Order #${orderData.orderNumber} - Manila Mart`,
    message: `
NEW ORDER RECEIVED
==================

Order Number: ${orderData.orderNumber}
Order Date: ${orderData.orderDate}

CUSTOMER INFORMATION
-------------------
Name: ${orderData.customer.firstName} ${orderData.customer.lastName}
Phone: ${orderData.customer.phone}
Email: ${orderData.customer.email}

PICKUP DETAILS
--------------
Date: ${orderData.customer.pickupDate}
Time: ${orderData.customer.pickupTime}

ORDER ITEMS
-----------
${itemsList}

TOTAL: $${orderData.total.toFixed(2)}

${orderData.customer.specialInstructions ? `SPECIAL INSTRUCTIONS:\n${orderData.customer.specialInstructions}` : ""}
    `.trim(),
    // Form fields for Formspree
    formData: {
      orderNumber: orderData.orderNumber,
      customerName: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
      customerEmail: orderData.customer.email,
      customerPhone: orderData.customer.phone,
      pickupDate: orderData.customer.pickupDate,
      pickupTime: orderData.customer.pickupTime,
      orderItems: itemsList,
      total: `$${orderData.total.toFixed(2)}`,
      specialInstructions: orderData.customer.specialInstructions || "None",
      _subject: `New Order #${orderData.orderNumber} - Manila Mart`,
      _replyto: orderData.customer.email,
    },
  };
}

// Helper to format contact form for email
export function formatContactEmail(formData: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) {
  return {
    subject: `New Contact Message from ${formData.firstName} ${formData.lastName}`,
    formData: {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      message: formData.message,
      _subject: `New Contact Message from ${formData.firstName} ${formData.lastName}`,
      _replyto: formData.email,
    },
  };
}

// Test Formspree configuration
export async function testFormspreeConfiguration(): Promise<{
  orderForm: boolean;
  contactForm: boolean;
  newsletterForm: boolean;
}> {
  const results = {
    orderForm: false,
    contactForm: false,
    newsletterForm: false,
  };

  // Test each form endpoint
  const testForm = async (formId: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'HEAD',
      });
      return response.status !== 404;
    } catch {
      return false;
    }
  };

  results.orderForm = await testForm(FORMSPREE_CONFIG.orderFormId);
  results.contactForm = await testForm(FORMSPREE_CONFIG.contactFormId);
  results.newsletterForm = await testForm(FORMSPREE_CONFIG.newsletterFormId);

  return results;
}
