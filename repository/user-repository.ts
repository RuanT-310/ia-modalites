import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScheduleItem, UserAccount } from "../types"; // Certifique-se de importar seus tipos corretamente

// Chaves constantes para evitar erros de digitação (Magic Strings)
const KEYS = {
  USERS_COLLECTION: '@app:users_v1',
  CURRENT_SESSION: '@app:session_v1'
};

export const userRepository = {
  
  // --- MÉTODOS DE COLEÇÃO (Todos os usuários) ---

  /**
   * Busca o mapa completo de usuários
   * Retorna: Record<email, UserAccount>
   */
  getAll: async (): Promise<Record<string, UserAccount>> => {
    try {
      const json = await AsyncStorage.getItem(KEYS.USERS_COLLECTION);
      return json ? JSON.parse(json) : {};
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return {};
    }
  },

  // --- MÉTODOS DE CRUD (Create, Read, Update) ---

  /**
   * Busca um único usuário pelo Email
   */
  findByEmail: async (email: string): Promise<UserAccount | null> => {
    try {
      const users = await userRepository.getAll();
      const normalizedEmail = email.trim().toLowerCase();
      return users[normalizedEmail] || null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Salva ou Atualiza um usuário (Upsert)
   * Serve tanto para cadastro quanto para update de perfil/treino
   */
  save: async (user: UserAccount): Promise<boolean> => {
    try {
      const users = await userRepository.getAll();
      const normalizedEmail = user.email.trim().toLowerCase();

      const updatedUsers = {
        ...users,
        [normalizedEmail]: user
      };

      await AsyncStorage.setItem(KEYS.USERS_COLLECTION, JSON.stringify(updatedUsers));
      return true;
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      return false;
    }
  },

  updateSchedule: async (email: string, schedule: ScheduleItem[]): Promise<boolean> => {
    try {
      // 1. Busca todos os usuários (limitação do AsyncStorage, precisa ler tudo)
      const users = await userRepository.getAll();
      const normalizedEmail = email.trim().toLowerCase();
      
      const currentUser = users[normalizedEmail];
      if (!currentUser) return false;

      // 2. Cria o objeto atualizado
      const updatedUser = { 
        ...currentUser, 
        schedule: schedule 
      };

      // 3. Atualiza a coleção
      const updatedUsers = {
        ...users,
        [normalizedEmail]: updatedUser
      };

      // 4. Salva no banco
      await AsyncStorage.setItem(KEYS.USERS_COLLECTION, JSON.stringify(updatedUsers));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar cronograma:', error);
      return false;
    }
  },

  // --- MÉTODOS DE SESSÃO (Login/Logout) ---

  /**
   * Define o usuário logado atualmente
   */
  setSession: async (email: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(KEYS.CURRENT_SESSION, email.trim().toLowerCase());
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  },

  /**
   * Retorna o email do usuário logado (se houver)
   */
  getSession: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(KEYS.CURRENT_SESSION);
    } catch (error) {
      return null;
    }
  },

  /**
   * Remove a sessão (Logout)
   */
  clearSession: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }
};