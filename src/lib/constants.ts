// Replace with your actual WhatsApp number in international format (no + or spaces)
// Example: India +91 98765 43210 → "919876543210"
export const WHATSAPP_NUMBER = "918072726703";

const waMessage = (plan?: string) =>
  encodeURIComponent(
    `Hi! I'd like to request access to Salon OS${plan ? ` (${plan} plan)` : ""}.\n\nMy salon name is: \nContact number: \nCity: \n\nThank you!`
  );

export const waLink = (plan?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage(plan)}`;
