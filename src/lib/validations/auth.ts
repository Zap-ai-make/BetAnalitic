import { z } from "zod";

// Password validation schema with detailed requirements
export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule")
  .regex(/[a-z]/, "Au moins une minuscule")
  .regex(/[0-9]/, "Au moins un chiffre");

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Minimum 3 caractères")
  .max(20, "Maximum 20 caractères")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Lettres, chiffres et underscores uniquement"
  );

// Email validation
export const emailSchema = z.string().email("Email invalide");

// Phone validation (E.164 format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide");

// Registration form schema
export const registerFormSchema = z
  .object({
    registrationType: z.enum(["email", "phone"]),
    email: z.string().optional(),
    phone: z.string().optional(),
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    ageVerified: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.registrationType === "email") {
        return emailSchema.safeParse(data.email).success;
      }
      return phoneSchema.safeParse(data.phone).success;
    },
    {
      message: "Champ requis invalide",
      path: ["email"],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.ageVerified === true, {
    message: "Vous devez confirmer avoir 18 ans ou plus",
    path: ["ageVerified"],
  });

export type RegisterFormData = z.infer<typeof registerFormSchema>;

// Login form schema
export const loginFormSchema = z.object({
  identifier: z.string().min(1, "Email, téléphone ou nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// Password strength calculation
export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;

  let score: number;
  let label: string;
  let color: string;

  if (password.length === 0) {
    score = 0;
    label = "";
    color = "transparent";
  } else if (metCount <= 1) {
    score = 1;
    label = "Faible";
    color = "var(--color-accent-red)";
  } else if (metCount === 2) {
    score = 2;
    label = "Moyen";
    color = "var(--color-accent-orange)";
  } else if (metCount === 3) {
    score = 3;
    label = "Bon";
    color = "var(--color-accent-gold)";
  } else {
    score = 4;
    label = "Fort";
    color = "var(--color-accent-green)";
  }

  return { score, label, color, requirements };
}
