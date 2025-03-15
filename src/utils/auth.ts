
// Simple authentication utilities for the app
// In a real-world scenario, you would use a proper auth provider

export interface User {
  id: string;
  username: string;
  created: Date;
}

const USER_KEY = 'mealPlanner_currentUser';
const USERS_KEY = 'mealPlanner_users';
const TEMP_PASSWORDS_KEY = 'mealPlanner_tempPasswords';

// Type for storing users
interface StoredUser {
  id: string;
  username: string;
  password: string; // Hashed password
  salt: string; // Salt for password hashing
  created: string;
}

// Type for storing temporary password flags
interface TempPasswordEntry {
  username: string;
  isTemporary: boolean;
}

// Get users from localStorage
const getUsers = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error('Error retrieving users:', error);
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get temporary password flags from localStorage
const getTempPasswords = (): TempPasswordEntry[] => {
  try {
    const tempPasswordsJson = localStorage.getItem(TEMP_PASSWORDS_KEY);
    return tempPasswordsJson ? JSON.parse(tempPasswordsJson) : [];
  } catch (error) {
    console.error('Error retrieving temporary password flags:', error);
    return [];
  }
};

// Save temporary password flags to localStorage
const saveTempPasswords = (entries: TempPasswordEntry[]): void => {
  localStorage.setItem(TEMP_PASSWORDS_KEY, JSON.stringify(entries));
};

// Mark a password as temporary
const markPasswordAsTemporary = (username: string): void => {
  const tempPasswords = getTempPasswords();
  
  // Remove any existing entry for this user
  const filteredEntries = tempPasswords.filter(entry => entry.username !== username);
  
  // Add the new entry
  filteredEntries.push({
    username,
    isTemporary: true
  });
  
  saveTempPasswords(filteredEntries);
};

// Mark a password as permanent
const markPasswordAsPermanent = (username: string): void => {
  const tempPasswords = getTempPasswords();
  
  // Remove any existing entry for this user
  const filteredEntries = tempPasswords.filter(entry => entry.username !== username);
  
  // Add the new entry with isTemporary set to false
  filteredEntries.push({
    username,
    isTemporary: false
  });
  
  saveTempPasswords(filteredEntries);
};

// Check if a password is temporary
export const isTemporaryPassword = async (username: string, password: string): Promise<boolean> => {
  // First verify the password is correct
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const hashedPassword = await hashPassword(password, user.salt);
  
  if (hashedPassword !== user.password) {
    throw new Error('Invalid credentials');
  }
  
  // Then check if it's marked as temporary
  const tempPasswords = getTempPasswords();
  const entry = tempPasswords.find(e => e.username === username);
  
  return entry?.isTemporary === true;
};

// Generate a random salt for password hashing
const generateSalt = (): string => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Hash a password with a given salt
const hashPassword = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create a new user
export const createUser = async (username: string, password: string): Promise<User> => {
  const users = getUsers();
  
  // Check if username already exists
  if (users.some(user => user.username === username)) {
    throw new Error('Username already exists');
  }
  
  const salt = generateSalt();
  const hashedPassword = await hashPassword(password, salt);
  
  const newUser: StoredUser = {
    id: `user_${Date.now()}`,
    username,
    password: hashedPassword,
    salt,
    created: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Mark this password as permanent (not temporary)
  markPasswordAsPermanent(username);
  
  // Convert to User type and save current user
  const user: User = {
    id: newUser.id,
    username: newUser.username,
    created: new Date(newUser.created),
  };
  
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
};

// Login a user
export const loginUser = async (username: string, password: string, newPassword?: string): Promise<User> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('Invalid username or password');
  }
  
  const user = users[userIndex];
  const hashedPassword = await hashPassword(password, user.salt);
  
  if (hashedPassword !== user.password) {
    throw new Error('Invalid username or password');
  }
  
  // If a new password is provided, update the user's password
  if (newPassword) {
    const salt = generateSalt();
    const hashedNewPassword = await hashPassword(newPassword, salt);
    
    users[userIndex] = {
      ...user,
      password: hashedNewPassword,
      salt,
    };
    
    saveUsers(users);
    
    // Mark the new password as permanent
    markPasswordAsPermanent(username);
  }
  
  // Convert to User type and save current user
  const loggedInUser: User = {
    id: user.id,
    username: user.username,
    created: new Date(user.created),
  };
  
  localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
  
  return loggedInUser;
};

// Request password reminder
export const requestPasswordReminder = async (username: string): Promise<string> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('Username not found');
  }
  
  // Generate a temporary password
  const tempPassword = Array.from(
    { length: 8 },
    () => "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[
      Math.floor(Math.random() * 62)
    ]
  ).join('');
  
  // Update the user's password with the temporary one
  const salt = generateSalt();
  const hashedPassword = await hashPassword(tempPassword, salt);
  
  users[userIndex] = {
    ...users[userIndex],
    password: hashedPassword,
    salt,
  };
  
  saveUsers(users);
  
  // Mark this password as temporary
  markPasswordAsTemporary(username);
  
  // In a real app, we would send this password via email
  // For this demo, we'll just return it to be displayed to the user
  return tempPassword;
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    return {
      ...user,
      created: new Date(user.created),
    };
  } catch (error) {
    console.error('Error retrieving current user:', error);
    return null;
  }
};

// Logout current user
export const logoutUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Check if a user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

// Associate data with a specific user
export const getUserStorageKey = (key: string): string => {
  const user = getCurrentUser();
  return user ? `${user.id}_${key}` : key;
};
