import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { EXERCISE_CATALOG } from './data';

// Hooks (A Lógica)
import { useAuth } from './hooks/useAuth';
import { useWorkout } from './hooks/useWorkout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Welcome } from './pages/Welcome';
import { SelectAge } from './pages/SelectAge';
import { Restrictions } from './pages/Restriction';
import { Availability } from './pages/Availability';
import { Dashboard } from './pages/Dashboard'; // O novo componente
import { ActivityCard } from './pages/ActivityCard'; // Assumindo que você extraiu este também

export default function App() {
  // 1. Lógica de Estado (Hooks)
  const auth = useAuth();
  const workout = useWorkout(auth.user, auth.updateCurrentUser);

  // 2. Estado de Navegação local
  const [step, setStep] = useState('welcome');
  const [authStep, setAuthStep] = useState('login');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');

  // 3. Efeito para roteamento inicial
  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        // Se tem perfil completo, vai pro dashboard, senão welcome
        setStep(auth.user?.profile ? 'dashboard' : 'welcome');
      } else {
        setAuthStep('login');
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user]);

  // Helpers
  const getExerciseById = (id: string) => EXERCISE_CATALOG.find(ex => ex.id === id);
  
  const getNextActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    return workout.schedule.find(item => item.date >= today && item.status === 'pending');
  };

  const nextActivityIsToday = () => {
    const nextActivity = getNextActivity();
    if (!nextActivity) return false;
    const today = new Date().toISOString().split('T')[0];
    return nextActivity.date === today;
  };

  // ==================== RENDERIZAÇÃO ====================

  if (auth.isLoading || workout.isGenerating) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size={60} color="#2563EB" />
        <Text style={styles.title}>{workout.isGenerating ? 'Criando programa...' : 'Carregando...'}</Text>
      </View>
    );
  }

  // --- Fluxo de Autenticação ---
  if (!auth.isAuthenticated) {
    if (authStep === 'register') {
      return (
        <Register 
          setAuthStep={setAuthStep} 
          authError={auth.error || authError} // Usa erro do hook ou local
          setAuthError={setAuthError}
          registerForm={registerForm} 
          setRegisterForm={setRegisterForm} 
          handleRegister={() => auth.register(registerForm.email, registerForm.password, registerForm.confirmPassword)} 
        />
      );
    }
    // Default to Login
    return (
      <Login 
        setAuthStep={setAuthStep} 
        authError={auth.error || authError}
        setAuthError={setAuthError}
        loginForm={loginForm} 
        setLoginForm={setLoginForm} 
        handleLogin={() => auth.login(loginForm.email, loginForm.password)} 
      />
    );
  }

  // --- Fluxo Principal do App ---
  
  // 1. Wizard de Configuração Inicial
  if (step === 'welcome') return <Welcome step={step} setStep={setStep} profile={workout.profile} setProfile={workout.setProfile} />;
  if (step === 'age') return <SelectAge step={step} setStep={setStep} profile={workout.profile} setProfile={workout.setProfile} />;
  if (step === 'restrictions') return <Restrictions setStep={setStep} profile={workout.profile} handleRestrictionToggle={workout.toggleRestriction} />;
  if (step === 'availability') return (
    <Availability 
      setStep={setStep} 
      profile={workout.profile} 
      setProfile={workout.setProfile} 
      handleGenerateSchedule={async () => {
         await workout.createSchedule();
         setStep('dashboard');
      }} 
      handleDayToggle={workout.toggleDay}
    />
  );

  // 2. Dashboard e Detalhes
  if (step === 'dashboard') {
    // Se tiver uma atividade selecionada, mostre o detalhe (ActivityCard)
    if (selectedActivity) {
      return (
        <ActivityCard 
          getExerciseById={getExerciseById} 
          selectedActivity={selectedActivity} 
          setSelectedActivity={setSelectedActivity} 
          handleLogout={auth.logout} 
          handleCompleteExercise={(date: string) => {
            workout.completeExercise(date);
            setSelectedActivity(null);
          }} 
        />
      );
    }

    // Senão, mostre o Dashboard principal
    const nextActivity = getNextActivity();
    const nextExercise = nextActivity ? getExerciseById(nextActivity.exerciseId) : null;

    return (
      <Dashboard 
        profile={workout.profile}
        schedule={workout.schedule}
        nextActivity={nextActivity}
        nextActivityIsToday={nextActivityIsToday}
        nextExercise={nextExercise}
        getExerciseById={getExerciseById}
        onSelectActivity={setSelectedActivity}
        onLogout={auth.logout}
        onChangePlan={() => setStep('restrictions')}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginTop: 20, fontSize: 18, color: '#555' }
});