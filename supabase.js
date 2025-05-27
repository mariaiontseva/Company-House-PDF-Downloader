// Supabase Client Configuration
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://iotwhyiisbazeqmowljv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvdHdoeWlpc2JhemVxbW93bGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDUwMzUsImV4cCI6MjA2Mzg4MTAzNX0.HYAZLeIjR9b9C9k0p3wgf73GvpVH4-Ag9wQbACLcsLc';

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

// Search History functions
export const searchHistory = {
    // Add company to search history
    async addSearch(companyData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null; // Only track for logged-in users
        
        const { data, error } = await supabase
            .from('search_history')
            .upsert({
                user_id: user.id,
                company_number: companyData.company_number,
                company_name: companyData.company_name,
                company_status: companyData.company_status,
                company_type: companyData.company_type,
                date_of_creation: companyData.date_of_creation,
                address: companyData.registered_office_address ? 
                    `${companyData.registered_office_address.address_line_1 || ''}, ${companyData.registered_office_address.locality || ''}, ${companyData.registered_office_address.postal_code || ''}`.replace(/^,\s*|,\s*$/g, '') : 
                    null,
                searched_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,company_number'
            })
            .select()
            .single();
        
        if (error) console.error('Error adding to search history:', error);
        return data;
    },

    // Get user's search history
    async getHistory() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('search_history')
            .select('*')
            .order('searched_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data;
    },

    // Check if company was already downloaded
    async checkDownloadStatus(companyNumber) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('search_history')
            .select('download_status, downloaded_at, company_name, download_count')
            .eq('company_number', companyNumber)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        return data;
    },

    // Mark company as downloaded
    async markAsDownloaded(companyNumber, paymentId = null) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('search_history')
            .update({
                download_status: 'downloaded',
                downloaded_at: new Date().toISOString(),
                download_count: supabase.raw('download_count + 1'),
                stripe_payment_id: paymentId,
                updated_at: new Date().toISOString()
            })
            .eq('company_number', companyNumber)
            .select()
            .single();

        if (error) console.error('Error marking as downloaded:', error);
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