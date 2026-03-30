// Supabase Auth client for authentication
import { supabaseClient, isSupabaseConfigured } from './supabase';
import { User } from '@/app/components/CartContext';
import { generateReferralCode } from '@/app/components/CartContext';

// Re-export isSupabaseConfigured for use in components
export { isSupabaseConfigured };

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Map Supabase user metadata to our User type
function mapSupabaseUser(metadata: any, userId: string): User {
  return {
    id: userId,
    firstName: metadata.first_name || metadata.firstName || 'Guest',
    lastName: metadata.last_name || metadata.lastName || 'User',
    email: metadata.email || '',
    phone: metadata.phone || '',
    loyaltyPoints: metadata.loyalty_points || metadata.loyaltyPoints || 50,
    tier: metadata.tier || 'bronze',
    wishlist: metadata.wishlist || [],
    addresses: metadata.addresses || [],
    orderHistory: metadata.order_history || metadata.orderHistory || [],
    referralCode: metadata.referral_code || metadata.referralCode || generateReferralCode(),
    referredBy: metadata.referred_by || metadata.referredBy,
    emailSubscribed: metadata.email_subscribed !== false,
    createdAt: metadata.created_at || new Date().toISOString(),
  };
}

// Login with email and password
export async function loginWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error: 'Authentication service not configured. Please set up Supabase first.',
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
    }

    const userData: User = profile 
      ? mapSupabaseUser(profile, data.user.id)
      : mapSupabaseUser(data.user.user_metadata, data.user.id);

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('Unexpected login error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// Register new user
export async function registerWithEmail(data: RegisterData): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error: 'Authentication service not configured. Please set up Supabase first.',
    };
  }

  try {
    const newReferralCode = generateReferralCode();
    
    const { data: authData, error } = await supabaseClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          referral_code: newReferralCode,
          referred_by: data.referralCode || null,
          loyalty_points: 50, // Welcome bonus
          tier: 'bronze',
          wishlist: [],
          addresses: [],
          order_history: [],
          email_subscribed: true,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message === 'User already registered'
          ? 'An account with this email already exists. Please sign in instead.'
          : error.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }

    // Create profile in profiles table
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert([{
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        loyalty_points: 50,
        tier: 'bronze',
        referral_code: newReferralCode,
        referred_by: data.referralCode || null,
        wishlist: [],
        addresses: [],
        order_history: [],
        email_subscribed: true,
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Non-critical error - user is still created
    }

    // Process referral if code provided
    if (data.referralCode) {
      await processReferral(data.referralCode, authData.user.id);
    }

    const user: User = {
      id: authData.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      loyaltyPoints: 50,
      tier: 'bronze',
      wishlist: [],
      addresses: [],
      orderHistory: [],
      referralCode: newReferralCode,
      referredBy: data.referralCode,
      emailSubscribed: true,
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Unexpected registration error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

// Logout user
export async function logoutUser(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return { success: true }; // No-op if not configured
  }

  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected logout error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during logout.',
    };
  }
}

// Get current session
export async function getCurrentSession(): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error: 'Authentication service not configured.',
    };
  }

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    if (!session?.user) {
      return {
        success: false,
        error: 'No active session.',
      };
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const userData: User = profile
      ? mapSupabaseUser(profile, session.user.id)
      : mapSupabaseUser(session.user.user_metadata, session.user.id);

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    console.error('Unexpected session error:', error);
    return {
      success: false,
      error: 'Failed to get current session.',
    };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error: 'Authentication service not configured.',
    };
  }

  try {
    const { error } = await supabaseClient
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        loyalty_points: updates.loyaltyPoints,
        tier: updates.tier,
        wishlist: updates.wishlist,
        addresses: updates.addresses,
        order_history: updates.orderHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      user: updates as User,
    };
  } catch (error) {
    console.error('Unexpected profile update error:', error);
    return {
      success: false,
      error: 'Failed to update profile.',
    };
  }
}

// Process referral code
async function processReferral(code: string, newUserId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabaseClient) return;

  try {
    // Find referrer by referral code
    const { data: referrer, error } = await supabaseClient
      .from('profiles')
      .select('id, loyalty_points')
      .eq('referral_code', code)
      .single();

    if (error || !referrer) {
      console.log('Referrer not found for code:', code);
      return;
    }

    // Award points to referrer (100 bonus points)
    await supabaseClient
      .from('profiles')
      .update({
        loyalty_points: (referrer.loyalty_points || 0) + 100,
        updated_at: new Date().toISOString(),
      })
      .eq('id', referrer.id);

    // Log referral
    await supabaseClient
      .from('referrals')
      .insert([{
        referrer_id: referrer.id,
        referred_id: newUserId,
        code: code,
        status: 'completed',
        points_awarded: 100,
      }]);

  } catch (error) {
    console.error('Referral processing error:', error);
  }
}

// Reset password request
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return {
      success: false,
      error: 'Authentication service not configured.',
    };
  }

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: 'Failed to send password reset email.',
    };
  }
}
