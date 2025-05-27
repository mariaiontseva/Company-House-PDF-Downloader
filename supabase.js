// Supabase Client Configuration
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your project URL
const supabaseAnonKey = 'YOUR_ANON_KEY'; // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const auth = {
    // Sign up with email
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    },

    // Sign in with email
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        return data;
    },

    // Sign in with Google
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return data;
    },

    // Sign in with Facebook
    async signInWithFacebook() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current user
    getUser() {
        return supabase.auth.getUser();
    },

    // Listen to auth changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Company monitoring functions
export const monitoring = {
    // Add company to monitoring list
    async addCompany(companyNumber, companyName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('monitored_companies')
            .insert({
                user_id: user.id,
                company_number: companyNumber,
                company_name: companyName
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Remove company from monitoring
    async removeCompany(companyNumber) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('monitored_companies')
            .delete()
            .eq('user_id', user.id)
            .eq('company_number', companyNumber);

        if (error) throw error;
    },

    // Get user's monitored companies
    async getMonitoredCompanies() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('monitored_companies')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Check if company is monitored
    async isMonitored(companyNumber) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('monitored_companies')
            .select('id')
            .eq('user_id', user.id)
            .eq('company_number', companyNumber)
            .single();

        return !error && data !== null;
    }
};

// User profile functions
export const profile = {
    // Get user profile
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    },

    // Update user profile
    async updateProfile(updates) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Check if user has credits
    async hasCredits() {
        const profile = await this.getProfile();
        return profile.credits > 0 || profile.subscription_tier !== 'free';
    },

    // Use a credit
    async useCredit() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase.rpc('decrement_credits', {
            user_id: user.id
        });

        if (error) throw error;
        return data;
    }
};

// Download history functions
export const downloads = {
    // Record a download
    async recordDownload(companyNumber, companyName, fileCount, stripePaymentId = null) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
            .from('download_history')
            .insert({
                user_id: user?.id || null,
                company_number: companyNumber,
                company_name: companyName,
                file_count: fileCount,
                stripe_payment_id: stripePaymentId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get user's download history
    async getHistory() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('download_history')
            .select('*')
            .eq('user_id', user.id)
            .order('downloaded_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    }
};

// Notification functions
export const notifications = {
    // Get user's notifications
    async getNotifications() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data;
    },

    // Mark notification as read
    async markAsRead(notificationId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('notifications')
            .update({ notification_sent: true })
            .eq('id', notificationId)
            .eq('user_id', user.id);

        if (error) throw error;
    }
};

// Initialize auth state listener
let authListener = null;

export function initializeAuth(onAuthChange) {
    if (authListener) {
        authListener.unsubscribe();
    }
    
    authListener = auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session);
        if (onAuthChange) {
            onAuthChange(event, session);
        }
    });
    
    return authListener;
}