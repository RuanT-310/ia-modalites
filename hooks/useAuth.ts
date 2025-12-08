// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { userRepository } from '../repository/user-repository'; // Verifique se o caminho está correto (repository ou services)

export function useAuth() {
  // Mudança principal: Não guardamos mais a lista de 'users', apenas o logado
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Carregar sessão inicial
  useEffect(() => {
    const init = async () => {
      try {
        const sessionEmail = await userRepository.getSession();
        if (sessionEmail) {
          const user = await userRepository.findByEmail(sessionEmail);
          if (user) {
            setCurrentUser(user);
          } else {
            // Sessão órfã (email existe na sessão mas não no banco)
            await userRepository.clearSession();
          }
        }
      } catch (err) {
        console.error("Erro ao restaurar sessão", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Nota: Removemos o useEffect que salvava 'users' automaticamente. 
  // Agora salvamos explicitamente nas funções abaixo.

  const login = async (email: string, pass: string) => {
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    
    // Busca direta no repositório (não mais no estado local)
    const user = await userRepository.findByEmail(cleanEmail);
    
    if (!user || user.password !== pass) {
      setError('Email ou senha inválidos');
      return false;
    }
    
    // Sucesso: Salva sessão e atualiza estado
    await userRepository.setSession(user.email);
    setCurrentUser(user);
    return true;
  };

  const register = async (email: string, pass: string, confirmPass: string) => {
    setError('');
    const cleanEmail = email.trim().toLowerCase();

    // Validações
    if (!cleanEmail || !pass) { setError('Preencha todos os campos'); return false; }
    if (pass.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return false; }
    if (pass !== confirmPass) { setError('As senhas não coincidem'); return false; }

    // Verifica se já existe no banco
    const existingUser = await userRepository.findByEmail(cleanEmail);
    if (existingUser) { 
      setError('Este email já está cadastrado'); 
      return false; 
    }

    const newUser: UserAccount = {
      email: cleanEmail,
      password: pass,
      profile: null,
      schedule: []
    };

    // Salva no banco -> Define Sessão -> Atualiza Estado Local
    const success = await userRepository.save(newUser);
    
    if (success) {
      await userRepository.setSession(cleanEmail);
      setCurrentUser(newUser);
      return true;
    } else {
      setError('Erro ao criar conta. Tente novamente.');
      return false;
    }
  };

  const logout = async () => {
    await userRepository.clearSession();
    setCurrentUser(null);
  };

  // Função para atualizar dados do usuário logado
  // Agora persiste imediatamente usando o repositório
  const updateCurrentUser = async (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...data };
    
    // 1. Atualiza visualmente (Optimistic UI)
    setCurrentUser(updatedUser);
    
    // 2. Persiste no banco
    await userRepository.save(updatedUser);
  };

  return {
    user: currentUser, // Retorna o objeto completo diretamente
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    register,
    logout,
    updateCurrentUser
  };
}