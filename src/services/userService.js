import { 
    doc, 
    setDoc, 
    getDoc 
  } from 'firebase/firestore';
  import { db } from '../config/fireBase';
  
  // યુઝર ડેટા સેવ કરો
  export const saveUserData = async (userId, userData) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  };
  
  // યુઝર ડેટા મેળવો
  export const getUserData = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      throw error;
    }
  };