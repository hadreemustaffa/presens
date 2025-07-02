'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { Departments } from '@/features/model/enums';
import { validatedAction } from '@/lib/middleware';
import { createClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const login = validatedAction(loginSchema, async (data) => {
  const supabase = await createClient();

  const { email, password } = data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
});

const signupSchema = z
  .object({
    fullName: z.string().min(3).max(255),
    email: z.string().email({ message: 'Invalid email address' }).min(3).max(255),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    employeeId: z.string().min(3).max(32),
    department: z.nativeEnum(Departments),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signup = validatedAction(signupSchema, async (data) => {
  const supabase = await createClient();

  const { fullName, email, password, employeeId, department } = data;

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        employee_id: employeeId,
        department: department,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    },
  });

  if (error) {
    return {
      error: error.message,
      fullName,
      email,
      employeeId,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/auth/sign-up-success');
});

const forgotPasswordSchema = z.object({
  email: z.string().email().min(3).max(255),
});

export const forgotPassword = validatedAction(forgotPasswordSchema, async (data) => {
  const supabase = await createClient();

  const { email } = data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
  });

  if (error) {
    return {
      error: 'Failed to send reset password email. Please try again.',
    };
  }

  revalidatePath('/', 'layout');
  return { success: true };
});

const updatePasswordSchema = z.object({
  password: z.string().min(8).max(100),
});

export const updatePassword = validatedAction(updatePasswordSchema, async (data) => {
  const supabase = await createClient();

  const { password } = data;

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error: 'Failed to update password. Please try again.',
    };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
});

export const logout = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      error: 'Failed to sign out. Please try again.',
    };
  }

  redirect('/');
};
