import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
  } from 'firebase/auth';
  import { auth } from '../config/fireBase';
  
  // સાઇન અપ
  export const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // લૉગિન
  export const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // લૉગઆઉટ
  export const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };