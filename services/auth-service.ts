import { User } from '@/types';

// Mock API response delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database
const USERS_DB: Record<string, { id: string; email: string; password: string; name: string }> = {};

// Mock tokens
const TOKENS: Record<string, string> = {};

// Mock reset tokens
const RESET_TOKENS: Record<string, { email: string; expiry: number }> = {};

/**
 * Login with email and password
 */
export const login = async (email: string, password: string) => {
  // Simulate API call
  await delay(1000);
  
  const normalizedEmail = email.toLowerCase().trim();
  const user = Object.values(USERS_DB).find(u => u.email === normalizedEmail);
  
  if (!user) {
    throw new Error("User not found. Please check your email or register.");
  }
  
  if (user.password !== password) {
    throw new Error("Invalid password. Please try again.");
  }
  
  // Generate token
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  TOKENS[user.id] = token;
  
  // Return user data (excluding password) and token
  const { password: _, ...userData } = user;
  return {
    user: userData as User,
    token
  };
};

/**
 * Register new user
 */
export const register = async (email: string, password: string, name: string) => {
  // Simulate API call
  await delay(1000);
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if user already exists
  if (Object.values(USERS_DB).some(u => u.email === normalizedEmail)) {
    throw new Error("Email already registered. Please login instead.");
  }
  
  // Validate password
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
  
  // Create new user
  const id = Math.random().toString(36).substring(2);
  const newUser = {
    id,
    email: normalizedEmail,
    password,
    name: name.trim()
  };
  
  USERS_DB[id] = newUser;
  
  // Generate token
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  TOKENS[id] = token;
  
  // Return user data (excluding password) and token
  const { password: _, ...userData } = newUser;
  return {
    user: userData as User,
    token
  };
};

/**
 * Logout user
 */
export const logout = () => {
  // In a real app, this would invalidate the token on the server
  return true;
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string) => {
  // Simulate API call
  await delay(1000);
  
  const normalizedEmail = email.toLowerCase().trim();
  const user = Object.values(USERS_DB).find(u => u.email === normalizedEmail);
  
  if (!user) {
    // Don't reveal if user exists or not for security
    return true;
  }
  
  // Generate reset token
  const resetToken = Math.random().toString(36).substring(2);
  
  // Store token with expiry (24 hours)
  RESET_TOKENS[resetToken] = {
    email: normalizedEmail,
    expiry: Date.now() + 24 * 60 * 60 * 1000
  };
  
  // In a real app, send email with reset link
  console.log(`Reset token for ${normalizedEmail}: ${resetToken}`);
  
  return true;
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, newPassword: string) => {
  // Simulate API call
  await delay(1000);
  
  const resetData = RESET_TOKENS[token];
  
  if (!resetData) {
    throw new Error("Invalid or expired reset token.");
  }
  
  if (Date.now() > resetData.expiry) {
    delete RESET_TOKENS[token];
    throw new Error("Reset token has expired. Please request a new one.");
  }
  
  // Find user by email
  const user = Object.values(USERS_DB).find(u => u.email === resetData.email);
  
  if (!user) {
    throw new Error("User not found.");
  }
  
  // Update password
  user.password = newPassword;
  
  // Remove used token
  delete RESET_TOKENS[token];
  
  return true;
};

/**
 * Update user profile
 */
export const updateProfile = async (userData: Partial<User>) => {
  // Simulate API call
  await delay(1000);
  
  const { id } = userData;
  
  if (!id || !USERS_DB[id]) {
    throw new Error("User not found.");
  }
  
  // Update user data
  USERS_DB[id] = {
    ...USERS_DB[id],
    ...userData,
    // Don't allow updating email or password through this method
    email: USERS_DB[id].email,
    password: USERS_DB[id].password
  };
  
  // Return updated user data (excluding password)
  const { password: _, ...updatedUserData } = USERS_DB[id];
  return updatedUserData as User;
};

/**
 * Verify token (for protected routes)
 */
export const verifyToken = async (token: string) => {
  // Simulate API call
  await delay(300);
  
  // Check if token exists in our tokens store
  const userId = Object.keys(TOKENS).find(id => TOKENS[id] === token);
  
  if (!userId) {
    throw new Error("Invalid token");
  }
  
  // Return user data
  const { password: _, ...userData } = USERS_DB[userId];
  return userData as User;
};