import { z } from "zod";

const nigerianPhone = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number (e.g. 08012345678)");

// ─── Auth schemas ─────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    phone: nigerianPhone,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
    role: z.enum(["provider", "client"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Provider onboarding schemas ─────────────────────────────────
export const providerStep1Schema = z.object({
  displayName: z
    .string()
    .min(3, "Display name must be at least 3 characters")
    .max(60, "Display name must be under 60 characters"),
  categories: z
    .array(z.enum(["development","design","tutoring","consulting","photography","writing","video","other"]))
    .min(1, "Select at least one service category"),
  bio: z
    .string()
    .min(80, "Bio must be at least 80 characters")
    .max(500, "Bio must be under 500 characters"),
  portfolioUrl: z
    .string()
    .url("Enter a valid URL (e.g. https://yourportfolio.com)")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
});

export const providerStep2Schema = z.object({
  idType: z.enum(["nin","voters_card","passport","drivers_licence"], {
    required_error: "Select an ID type",
  }),
  idNumber: z.string().min(6, "Enter a valid ID number"),
});

export const providerStep3Schema = z.object({
  bankCode: z.string().min(1, "Select your bank"),
  accountNumber: z
    .string()
    .length(10, "Account number must be exactly 10 digits")
    .regex(/^\d+$/, "Account number must contain only digits"),
  accountName: z.string().min(2, "Account name must be confirmed"),
});

// ─── Client onboarding schemas ────────────────────────────────────
export const clientStep1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: nigerianPhone,
  companyName: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
});

// ─── Project creation schema ──────────────────────────────────────
export const milestoneSchema = z.object({
  title: z.string().min(3, "Milestone title is required").max(80),
  description: z
    .string()
    .min(20, "Describe what this milestone covers (min 20 chars)"),
  deliverable: z
    .string()
    .min(10, "What is the specific deliverable? (min 10 chars)"),
  amount: z
    .number({ invalid_type_error: "Enter a valid amount" })
    .min(1000, "Minimum milestone amount is ₦1,000")
    .max(10_000_000, "Maximum milestone amount is ₦10,000,000"),
});

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(5, "Project title must be at least 5 characters")
    .max(100, "Project title must be under 100 characters"),
  description: z
    .string()
    .min(30, "Add a detailed project description (min 30 chars)")
    .max(2000),
  clientEmail: z
    .string()
    .email("Enter a valid client email")
    .optional()
    .or(z.literal("")),
  milestones: z
    .array(milestoneSchema)
    .min(1, "Add at least one milestone")
    .max(10, "Maximum 10 milestones per project"),
});

// ─── Milestone submission schema ──────────────────────────────────
export const milestoneSubmitSchema = z.object({
  deliveryNote: z
    .string()
    .min(50, "Describe what you delivered (min 50 characters)"),
});

export const revisionRequestSchema = z.object({
  notes: z
    .string()
    .min(20, "Describe what needs to be revised (min 20 chars)"),
});

export const disputeSchema = z.object({
  reason: z.enum([
    "work_not_delivered",
    "poor_quality",
    "not_as_described",
    "incomplete_delivery",
    "other",
  ], { required_error: "Select a reason for the dispute" }),
  description: z
    .string()
    .min(50, "Describe the issue in detail (min 50 chars)"),
});

// ─── Type exports ─────────────────────────────────────────────────
export type LoginFormData            = z.infer<typeof loginSchema>;
export type RegisterFormData         = z.infer<typeof registerSchema>;
export type ProviderStep1Data        = z.infer<typeof providerStep1Schema>;
export type ProviderStep2Data        = z.infer<typeof providerStep2Schema>;
export type ProviderStep3Data        = z.infer<typeof providerStep3Schema>;
export type ClientStep1Data          = z.infer<typeof clientStep1Schema>;
export type CreateProjectData        = z.infer<typeof createProjectSchema>;
export type MilestoneSubmitData      = z.infer<typeof milestoneSubmitSchema>;
export type RevisionRequestData      = z.infer<typeof revisionRequestSchema>;
export type DisputeData              = z.infer<typeof disputeSchema>;
