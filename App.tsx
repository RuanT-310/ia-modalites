import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react-native';
import { ScheduleItem, UserAccount, UserProfile } from './types'; // Certifique-se que este arquivo existe
import { generateSchedule } from './ia-service'; // Certifique-se que este arquivo existe
import { EXERCISE_CATALOG } from './data'; // Certifique-se que este arquivo existe
import { styles } from './styles';
import { Availability } from './pages/Availability';
import { Restrictions } from './pages/Restriction';
import { SelectAge } from './pages/SelectAge';
import { Welcome } from './pages/Welcome';
import { ActivityCard } from './pages/ActivityCard';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { storage } from './storage';

// Helper para simular a API do localStorage usando AsyncStorage


export default function App() {
  const [authStep, setAuthStep] = useState<'login' | 'register' | 'app'>('login');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [users, setUsers] = useState<Record<string, UserAccount>>({});
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [step, setStep] = useState<'welcome' | 'age' | 'restrictions' | 'activity' | 'availability' | 'loading' | 'dashboard'>('welcome');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    restrictions: [],
    availability: { days: [], time: '08:00' }
  });
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleItem | null>(null);

  // Carregar dados ao iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar usuários
        const usersData = await storage.get('app:users');
        if (usersData) {
          setUsers(usersData.value);
        }

        // Carregar sessão atual
        const sessionData = await storage.get('app:current-user');
        if (sessionData && sessionData.value) {
          setCurrentUser(sessionData.value);
          setAuthStep('app');
        }
      } catch (error) {
        console.log('Primeira vez usando o app');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Salvar usuários quando mudarem
  useEffect(() => {
    if (!isLoading && Object.keys(users).length > 0) {
      storage.set('app:users', users).catch((err: any) => 
        console.error('Erro ao salvar usuários:', err)
      );
    }
  }, [users, isLoading]);

  // Carregar dados do usuário logado
  useEffect(() => {
    if (currentUser && users[currentUser]) {
      const userData = users[currentUser];
      if (userData.profile) {
        setProfile(userData.profile);
        setSchedule(userData.schedule);
        setStep('dashboard');
      } else {
        setStep('welcome');
      }
    }
  }, [currentUser]);

  const handleLogin = async () => {
    setAuthError('');
    const user = users[loginForm.email.toLowerCase().trim()];
    
    if (!user) {
      setAuthError('Usuário não encontrado');
      return;
    }
    
    if (user.password !== loginForm.password) {
      setAuthError('Senha incorreta');
      return;
    }
    
    const email = loginForm.email.toLowerCase().trim();
    setCurrentUser(email);
    setAuthStep('app');
    
    try {
      await storage.set('app:current-user', email);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  const handleRegister = async () => {
    setAuthError('');
    const email = registerForm.email.toLowerCase().trim();
    
    if (!email || !registerForm.password) {
      setAuthError('Preencha todos os campos');
      return;
    }
    
    if (registerForm.password.length < 6) {
      setAuthError('Senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('As senhas não coincidem');
      return;
    }
    
    if (users[email]) {
      setAuthError('Este email já está cadastrado');
      return;
    }
    
    const newUsers = {
      ...users,
      [email]: {
        email: email,
        password: registerForm.password,
        profile: null,
        schedule: []
      }
    };
    
    setUsers(newUsers);
    setCurrentUser(email);
    setAuthStep('app');
    
    try {
      await storage.set('app:current-user', email);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      const updatedUsers = {
        ...users,
        [currentUser]: {
          ...users[currentUser],
          profile: profile as UserProfile,
          schedule: schedule
        }
      };
      
      setUsers(updatedUsers);
      
      try {
        await storage.set('app:users', updatedUsers);
        await storage.delete('app:current-user');
      } catch (error) {
        console.error('Erro ao salvar dados:', error);
      }
    }
    
    setCurrentUser(null);
    setAuthStep('login');
    setStep('welcome');
    setProfile({ restrictions: [], availability: { days: [], time: '08:00' } });
    setSchedule([]);
    setLoginForm({ email: '', password: '' });
  };

  const handleRestrictionToggle = (restriction: string) => {
    const current = profile.restrictions || [];
    setProfile({
      ...profile,
      restrictions: current.includes(restriction)
        ? current.filter(r => r !== restriction)
        : [...current, restriction]
    });
  };

  const handleDayToggle = (day: string) => {
    const current = profile.availability?.days || [];
    setProfile({
      ...profile,
      availability: {
        ...profile.availability!,
        days: current.includes(day)
          ? current.filter(d => d !== day)
          : [...current, day]
      }
    });
  };

  const handleGenerateSchedule = async () => {
    setStep('loading');
    const fullProfile: UserProfile = {
      name: profile.name || 'Usuário',
      age: profile.age || 65,
      restrictions: profile.restrictions || [],
      availability: profile.availability || { days: [], time: '08:00' }
    };
    
    // Pequeno delay artificial para UX, já que não temos delay de rede real aqui
    setTimeout(async () => {
      const newSchedule = await generateSchedule(fullProfile);
      setSchedule(newSchedule);
      
      if (currentUser) {
        const updatedUsers = {
          ...users,
          [currentUser]: {
            ...users[currentUser],
            profile: fullProfile,
            schedule: newSchedule
          }
        };
        setUsers(updatedUsers);
        try {
          await storage.set('app:users', updatedUsers);
        } catch (error) {
          console.error('Erro ao salvar cronograma:', error);
        }
      }
      
      setStep('dashboard');
    }, 1500);
  };

  const handleCompleteExercise = async (date: string) => {
    const updatedSchedule = schedule.map(item => 
      item.date === date ? { ...item, status: 'completed' as const } : item
    );
    setSchedule(updatedSchedule);
    
    if (currentUser) {
      const updatedUsers = {
        ...users,
        [currentUser]: {
          ...users[currentUser],
          schedule: updatedSchedule
        }
      };
      setUsers(updatedUsers);
      
      try {
        await storage.set('app:users', updatedUsers);
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
      }
    }
  };

  const getNextActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    return schedule.find(item => item.date >= today && item.status === 'pending');
  };

  const getExerciseById = (id: string) => EXERCISE_CATALOG.find(ex => ex.id === id);

  // --- RENDER ---

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // ==================== AUTH VIEWS ====================
  if (authStep === 'login') {
    return <Login 
     setAuthStep={setAuthStep} authError={authError} setAuthError={setAuthError} 
     loginForm={loginForm} setLoginForm={setLoginForm} 
     handleLogin={handleLogin} />
  }

  if (authStep === 'register') {
    return <Register 
     setAuthStep={setAuthStep} authError={authError} setAuthError={setAuthError} 
     registerForm={registerForm} setRegisterForm={setRegisterForm} 
     handleRegister={handleRegister} />
  }

  // ==================== APP VIEWS ====================
  if (step === 'welcome') return <Welcome
    step={step} 
    setStep={setStep} 
    profile={profile} 
    setProfile={setProfile} 
    />

  if (step === 'age') return <SelectAge 
    step={step} 
    setStep={setStep} 
    profile={profile} 
    setProfile={setProfile} 
    />  

  if (step === 'restrictions') return <Restrictions 
    setStep={setStep} 
    profile={profile} 
    handleRestrictionToggle={handleRestrictionToggle} 
    />

  if (step === 'availability') return <Availability 
    setStep={setStep} 
    profile={profile} 
    setProfile={setProfile} 
    handleGenerateSchedule={handleGenerateSchedule} 
    handleDayToggle={handleDayToggle}
    />
  

  if (step === 'loading') {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size={60} color="#2563EB" />
        <Text style={styles.wizardTitle}>Criando seu programa...</Text>
        <Text style={styles.wizardSubtitle}>Selecionando os melhores exercícios</Text>
      </View>
    );
  }

  if (step === 'dashboard') {
    const nextActivity = getNextActivity();
    const nextExercise = nextActivity ? getExerciseById(nextActivity.exerciseId) : null;

    if (selectedActivity) {
      return <ActivityCard 
        getExerciseById={getExerciseById} 
        selectedActivity={selectedActivity} 
        setSelectedActivity={setSelectedActivity} 
        handleLogout={handleLogout} 
        handleCompleteExercise={handleCompleteExercise} 
        />
    }

    return (
      <SafeAreaView style={styles.containerLight}>
        <ScrollView contentContainerStyle={styles.padding}>
          <View style={styles.headerRow}>
            <View />
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Olá, {profile.name}! 👋</Text>
            <Text style={styles.welcomeSubtitle}>Seu programa de exercícios</Text>
          </View>

          {nextActivity && nextExercise && (
            <View style={styles.highlightCard}>
              <View style={styles.row}>
                <Calendar size={24} color="#FFF" />
                <Text style={styles.highlightTitle}> Próxima Atividade</Text>
              </View>
              
              <Text style={styles.highlightExerciseName}>{nextExercise.title}</Text>
              
              <View style={styles.row}>
                <Clock size={20} color="#FFF" />
                <Text style={styles.highlightInfo}> Hoje às {profile.availability?.time}</Text>
                <Text style={styles.highlightInfo}> • {nextExercise.durationMin} min</Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedActivity(nextActivity)}
                style={styles.highlightButton}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.highlightButtonText}>Ver Detalhes</Text>
                  <ChevronRight size={20} color="#16A34A" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.scheduleSection}>
            <Text style={styles.sectionHeader}>Cronograma Semanal</Text>
            
            {schedule.map((item, index) => {
              const exercise = getExerciseById(item.exerciseId);
              const date = new Date(item.date);
              const isCompleted = item.status === 'completed';
              
              return (
                <TouchableOpacity
                  key={`${item.date}-${index}`}
                  onPress={() => setSelectedActivity(item)}
                  style={[styles.scheduleItem, isCompleted && styles.scheduleItemCompleted]}
                >
                  <View style={styles.rowBetween}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.row}>
                        <Text style={styles.dateText}>
                          {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                        {isCompleted && <CheckCircle size={18} color="#16A34A" style={{ marginLeft: 8 }} />}
                      </View>
                      <Text style={styles.scheduleTitle}>{exercise?.title}</Text>
                      <Text style={styles.scheduleSubtitle}>{exercise?.durationMin} minutos</Text>
                    </View>
                    <ChevronRight size={24} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity 
          style={[styles.linkButton, styles.buttonContent]} 
          onPress={() => setStep('availability')}>
            <Text>Alterar Exercícios</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}