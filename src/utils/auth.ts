
// Simple authentication utilities for the app
// In a real-world scenario, you would use a proper auth provider

export interface User {
  id: string;
  username: string;
  created: Date;
}

const USER_KEY = 'mealPlanner_currentUser';
const USERS_KEY = 'mealPlanner_users';

// Type for storing users
interface StoredUser {
  id: string;
  username: string;
  password: string; // Hashed password
  salt: string; // Salt for password hashing
  created: string;
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
export const loginUser = async (username: string, password: string): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  const hashedPassword = await hashPassword(password, user.salt);
  
  if (hashedPassword !== user.password) {
    throw new Error('Invalid username or password');
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
