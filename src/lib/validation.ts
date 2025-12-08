import { z } from "zod";

// Luhn algorithm for card number validation
const isValidCardNumber = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Check if expiry date is valid and in the future
const isValidExpiry = (expiry: string): boolean => {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  
  const month = parseInt(match[1], 10);
  const year = parseInt("20" + match[2], 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

export const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .refine((val) => isValidCardNumber(val), {
      message: "Invalid card number",
    }),
  expiry: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format")
    .refine((val) => isValidExpiry(val), {
      message: "Card has expired or invalid date",
    }),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
  cardName: z
    .string()
    .min(1, "Cardholder name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
});

export type PaymentFormData = z.infer<typeof paymentFormSchema>;

export const profileFormSchema = z.object({
  fullName: z
    .string()
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s'-]*$/, "Name contains invalid characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email is too long"),
  phone: z
    .string()
    .max(20, "Phone number is too long")
    .regex(/^[\d\s+()-]*$/, "Phone contains invalid characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>;
