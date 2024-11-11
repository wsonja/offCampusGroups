import React, { createContext, useContext, ReactNode, useState } from 'react';
import { collection, CollectionReference } from 'firebase/firestore';
import { db } from './firebase-config';

interface ProfileCt {
    name: string;
    email: string;
    bio: string;
    url: string;
}

// Define the context type
type AppContextType = {
  usersCollectionRef: CollectionReference;
  eventsCollectionRef: CollectionReference;
  profileCt: ProfileCt | null;
  setProfileCt: React.Dispatch<React.SetStateAction<ProfileCt | null>>;
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// AppProvider component
type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Initialize the collection references
  const usersCollectionRef = collection(db, 'users');
  const eventsCollectionRef = collection(db, 'events');
  const [profileCt, setProfileCt] = useState<ProfileCt | null>(null);

  return (
    <AppContext.Provider value={{ usersCollectionRef, eventsCollectionRef, profileCt, setProfileCt }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
