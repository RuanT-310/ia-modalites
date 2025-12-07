import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, CheckCircle, Clock, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { ScheduleItem, UserAccount, UserProfile } from './types'; // Certifique-se que este arquivo existe
import { generateSchedule } from './ia-service'; // Certifique-se que este arquivo existe
import { EXERCISE_CATALOG } from './data'; // Certifique-se que este arquivo existe
import { styles } from './styles';

// Helper para simular a API do localStorage usando AsyncStorage
const storage = {
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
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerSpace}>
            <Text style={styles.appTitle}>AL Modalities</Text>
            <Text style={styles.subtitle}>Entre na sua conta</Text>
          </View>
          
          <View style={styles.card}>
            {!!authError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={loginForm.email}
              onChangeText={(text) => setLoginForm({ ...loginForm, email: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha"
              secureTextEntry
              value={loginForm.password}
              onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
            />
            
            <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => { setAuthStep('register'); setAuthError(''); }}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (authStep === 'register') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerSpace}>
            <Text style={styles.appTitle}>AL Modalities</Text>
            <Text style={styles.subtitle}>Criar nova conta</Text>
          </View>
          
          <View style={styles.card}>
            {!!authError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={registerForm.email}
              onChangeText={(text) => setRegisterForm({ ...registerForm, email: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Senha (mín. 6 caracteres)"
              secureTextEntry
              value={registerForm.password}
              onChangeText={(text) => setRegisterForm({ ...registerForm, password: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirmar senha"
              secureTextEntry
              value={registerForm.confirmPassword}
              onChangeText={(text) => setRegisterForm({ ...registerForm, confirmPassword: text })}
            />
            
            <TouchableOpacity style={styles.buttonSuccess} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => { setAuthStep('login'); setAuthError(''); }}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Já tem conta? Entre aqui</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==================== APP VIEWS ====================
  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.scrollContent}>
          <View style={styles.headerSpace}>
            <Text style={styles.appTitle}>AL Modalities</Text>
            <Text style={styles.subtitle}>Fitness personalizado para você</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.bodyText}>
              Responda algumas perguntas rápidas e criaremos um programa de exercícios seguro e personalizado.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Como você se chama?"
              value={profile.name || ''}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
            
            <TouchableOpacity 
              onPress={() => setStep('age')}
              disabled={!profile.name}
              style={[styles.buttonPrimary, !profile.name && styles.buttonDisabled]}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Começar</Text>
                <ChevronRight size={24} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'age') {
    return (
      <SafeAreaView style={styles.containerLight}>
        <View style={styles.padding}>
          <TouchableOpacity onPress={() => setStep('welcome')} style={styles.backButton}>
            <ArrowLeft size={24} color="#2563EB" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.wizardContainer}>
            <View style={styles.centerText}>
              <Text style={styles.wizardTitle}>Qual é sua idade?</Text>
              <Text style={styles.wizardSubtitle}>Isso nos ajuda a personalizar seus exercícios</Text>
            </View>

            <View style={styles.card}>
              <TextInput
                style={styles.inputHuge}
                placeholder="Ex: 65"
                keyboardType="numeric"
                maxLength={3}
                value={profile.age?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, age: parseInt(text) || 0 })}
              />
              <Text style={styles.unitText}>anos</Text>
            </View>

            <TouchableOpacity
              onPress={() => setStep('restrictions')}
              disabled={!profile.age || profile.age < 50}
              style={[styles.buttonPrimary, (!profile.age || profile.age < 50) && styles.buttonDisabled]}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continuar</Text>
                <ChevronRight size={24} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'restrictions') {
    const restrictions = [
      { id: 'knee_pain', label: 'Dor nos joelhos' },
      { id: 'back_pain', label: 'Dor nas costas' },
      { id: 'heart_condition', label: 'Problema cardíaco' },
    ];

    return (
      <SafeAreaView style={styles.containerLight}>
        <ScrollView contentContainerStyle={styles.padding}>
          <TouchableOpacity onPress={() => setStep('age')} style={styles.backButton}>
            <ArrowLeft size={24} color="#2563EB" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.wizardContainer}>
            <View style={styles.centerText}>
              <Text style={styles.wizardTitle}>Limitações Físicas</Text>
              <Text style={styles.wizardSubtitle}>Selecione todas que se aplicam</Text>
            </View>

            <View style={styles.optionsContainer}>
              {restrictions.map(({ id, label }) => {
                const isSelected = profile.restrictions?.includes(id);
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => handleRestrictionToggle(id)}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              <TouchableOpacity
                onPress={() => handleRestrictionToggle('none')}
                style={[
                  styles.optionButton, 
                  profile.restrictions?.includes('none') && styles.optionButtonSuccess
                ]}
              >
                <Text style={[
                    styles.optionText, 
                    profile.restrictions?.includes('none') && styles.optionTextSelected
                ]}>
                  ✓ Nenhuma limitação
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setStep('availability')}
              style={styles.buttonPrimary}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continuar</Text>
                <ChevronRight size={24} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 'availability') {
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    return (
      <SafeAreaView style={styles.containerLight}>
        <ScrollView contentContainerStyle={styles.padding}>
          <TouchableOpacity onPress={() => setStep('restrictions')} style={styles.backButton}>
            <ArrowLeft size={24} color="#2563EB" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.wizardContainer}>
            <View style={styles.centerText}>
              <Text style={styles.wizardTitle}>Disponibilidade</Text>
              <Text style={styles.wizardSubtitle}>Quando você pode se exercitar?</Text>
            </View>

            <View style={styles.sectionContainer}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Dias da semana</Text>
                <View style={styles.gridContainer}>
                  {days.map(day => {
                     const isSelected = profile.availability?.days.includes(day);
                     return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => handleDayToggle(day)}
                        style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                      >
                        <Text style={[styles.gridItemText, isSelected && styles.gridItemTextSelected]}>
                          {day.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Horário preferido</Text>
                <TextInput
                  style={styles.inputCenter}
                  placeholder="08:00"
                  value={profile.availability?.time}
                  onChangeText={(text) => setProfile({
                    ...profile,
                    availability: { ...profile.availability!, time: text }
                  })}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerateSchedule}
              disabled={!profile.availability?.days.length}
              style={[styles.buttonSuccess, !profile.availability?.days.length && styles.buttonDisabled]}
            >
               <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Criar Meu Programa ✨</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
      const exercise = getExerciseById(selectedActivity.exerciseId);
      return (
        <SafeAreaView style={styles.containerLight}>
          <ScrollView contentContainerStyle={styles.padding}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => setSelectedActivity(null)} style={styles.backButton}>
                <ArrowLeft size={24} color="#2563EB" />
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.detailTitle}>{exercise?.title}</Text>
              
              <View style={styles.tagsRow}>
                <View style={styles.tagBlue}>
                  <Text style={styles.tagTextBlue}>{exercise?.category}</Text>
                </View>
                <View style={styles.tagPurple}>
                  <Clock size={16} color="#6B21A8" />
                  <Text style={styles.tagTextPurple}> {exercise?.durationMin} min</Text>
                </View>
              </View>

              <View style={styles.instructionBox}>
                <Text style={styles.sectionHeader}>Instruções</Text>
                <Text style={styles.descriptionText}>
                  {exercise?.description}
                </Text>
              </View>

              {selectedActivity.status === 'pending' && (
                <TouchableOpacity
                  onPress={() => {
                    handleCompleteExercise(selectedActivity.date);
                    setSelectedActivity(null);
                  }}
                  style={styles.buttonSuccess}
                >
                  <View style={styles.buttonContent}>
                    <CheckCircle size={24} color="#FFF" />
                    <Text style={styles.buttonText}>Marcar como Concluído</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
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