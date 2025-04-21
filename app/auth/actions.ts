"use server";

import { createClient } from "@/utils/supabase/server";

export type AuthError = {
  message: string;
  status: number;
};

export async function signIn(
  email: string,
  password: string
): Promise<AuthError | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        message: error.message,
        status: 400,
      };
    }

    return null;
  } catch (error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  college: string
): Promise<AuthError | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          college,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        message: error.message,
        status: 400,
      };
    }

    return null;
  } catch (error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}

export async function resetPassword(email: string): Promise<AuthError | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        message: error.message,
        status: 400,
      };
    }

    return null;
  } catch (error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}

export async function updatePassword(
  newPassword: string
): Promise<AuthError | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        message: error.message,
        status: 400,
      };
    }

    return null;
  } catch (error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}

export async function signOut(): Promise<AuthError | null> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        message: error.message,
        status: 400,
      };
    }

    return null;
  } catch (error) {
    return {
      message: "An unexpected error occurred",
      status: 500,
    };
  }
}
