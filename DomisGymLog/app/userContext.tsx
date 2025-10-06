import React, { createContext, useState, ReactNode } from 'react';

interface User {
  UserID: number;
  Username: string;
}

interface UserContextType {
  soloUser: User | null;
  duoUsers: [User, User] | null; // null if no duo
  setSoloUser: (user: User | null) => void;
  setDuoUsers: (users: [User, User] | null) => void;
}

export const UserContext = createContext<UserContextType>({
  soloUser: null,
  duoUsers: null,
  setSoloUser: () => {},
  setDuoUsers: () => {},
});

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soloUser, setSoloUser] = useState<User | null>(null);
  const [duoUsers, setDuoUsers] = useState<[User, User] | null>(null);

  return (
    <UserContext.Provider value={{ soloUser, duoUsers, setSoloUser, setDuoUsers }}>
      {children}
    </UserContext.Provider>
  );
};
