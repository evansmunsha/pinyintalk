"use server";

import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  acceptTerms: z.preprocess(
    (value) => (value === "on" || value === true ? "on" : undefined),
    z.literal("on")
  ),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AuthState = {
  error?: string;
  success?: boolean;
} | null;

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, email, password } = validatedFields.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "User with this email already exists",
    };
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch {
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}
