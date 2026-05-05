import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role =
  | "Super Admin"
  | "Company Admin"
  | "Employee"
  | "Asset Manager"
  | "Procurement Officer"
  | "Finance Viewer"
  | "Field Technician"
  | "Platform Owner";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: Role | Role[]) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user for demo purposes - usually this would come from an auth provider
const mockUser: User = {
  id: "1",
  name: "Sabbir Khan",
  email: "Admin@asstella.com",
  role: "Platform Owner",
  permissions: ["all"],
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUser);

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    if (currentUser.permissions.includes("all")) return true;
    return currentUser.permissions.includes(permission);
  };

  const isRole = (role: Role | Role[]) => {
    if (!currentUser) return false;
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    return currentUser.role === role;
  };

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, hasPermission, isRole }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
