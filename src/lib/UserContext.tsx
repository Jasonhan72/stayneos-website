// Re-export from context for compatibility
export { 
  UserProvider, 
  useUser, 
  useAuth,
  getAvatarColor, 
  getInitials 
} from "./context/UserContext";

// Also export types
export type { UserProfile, UserPreferences } from "./context/UserContext";
