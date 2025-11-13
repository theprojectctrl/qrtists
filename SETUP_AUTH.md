# QRtists Authentication Setup Guide

This guide will help you set up authentication and favorites functionality for QRtists using Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Supabase project created

## Step 1: Create Supabase Tables

You need to create two tables in your Supabase database:

### 1. `user_profiles` table

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `user_favorites` table

```sql
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  qr_code_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, qr_code_id)
);
```

### 3. Enable Row Level Security (RLS)

Enable RLS on both tables and create policies:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- User favorites policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 2: Configure Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google provider
4. Add your Google OAuth credentials (Client ID and Client Secret)
5. Add your site URL to the redirect URLs

## Step 3: Update auth.js

1. Open `js/auth.js`
2. Replace `YOUR_SUPABASE_URL` with your Supabase project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon/public key

You can find these in your Supabase project settings under API.

## Step 4: Test the Setup

1. Open your website
2. Click "Sign In"
3. Try creating an account with email/password
4. Try signing in with Google (if configured)
5. Navigate to the QR codes page
6. Click the heart icon on a QR code to add it to favorites
7. Click "My Favorites" in the user menu to view saved QR codes

## Features

- **Email/Password Authentication**: Users can create accounts with username, email, and password
- **Google Sign-In**: Users can sign in with their Google account
- **Favorites System**: Users can save QR codes to their favorites
- **Favorites Modal**: View all saved QR codes in a modal
- **Download QR Codes**: Download QR code images

## Troubleshooting

- **"Authentication is not configured"**: Make sure you've updated the Supabase URL and key in `js/auth.js`
- **Database errors**: Verify that all tables are created and RLS policies are set up correctly
- **Google sign-in not working**: Check that Google OAuth is properly configured in Supabase
- **Favorites not saving**: Check browser console for errors and verify the `user_favorites` table exists

