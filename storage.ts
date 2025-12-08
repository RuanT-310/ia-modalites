import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  get: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? { value: JSON.parse(value) } : null; // Mantendo formato original { value: ... }
    } catch (e) { return null; }
  },
  set: async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error(e); }
  },
  delete: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) { console.error(e); }
  }
};