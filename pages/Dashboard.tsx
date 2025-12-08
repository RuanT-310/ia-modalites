// src/screens/Dashboard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, ChevronRight, CheckCircle } from 'lucide-react-native';
import { styles } from '../styles';
import { SafeAreaView } from 'react-native-safe-area-context';
// Importe seus tipos e estilos aqui

interface DashboardProps {
  profile: any;
  schedule: any[];
  nextActivity: any;
  nextExercise: any;
  nextActivityIsToday: () => boolean;
  getExerciseById: (id: string) => any;
  onSelectActivity: (activity: any) => void;
  onLogout: () => void;
  onChangePlan: () => void;
}

export function Dashboard({ 
  profile, 
  schedule, 
  nextActivity,
  nextExercise,
  nextActivityIsToday,
  getExerciseById, 
  onSelectActivity, 
  onLogout,
  onChangePlan
}: DashboardProps) {
  
  return (
    <SafeAreaView style={styles.containerLight}>
      <ScrollView contentContainerStyle={styles.padding}>
        {/* Header com Logout */}
        <View style={styles.headerRow}>
          <View />
          <TouchableOpacity onPress={onLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
        
        {/* Boas vindas */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Olá, {profile.name}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>Seu programa de exercícios</Text>
        </View>

        {/* Card de Destaque (Próxima Atividade) */}
        {nextActivity && nextActivityIsToday() && nextExercise && (
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
              onPress={() => onSelectActivity(nextActivity)}
              style={styles.highlightButton}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.highlightButtonText}>Ver Detalhes</Text>
                <ChevronRight size={20} color="#16A34A" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de Cronograma */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionHeader}>Cronograma Semanal</Text>
          
          {schedule.map((item, index) => {
            const exercise = getExerciseById(item.exerciseId);
            const [year, month, day] = item.date.split('-').map(Number);
            // O mês no JavaScript começa do 0 (Janeiro = 0), então subtraímos 1
            const date = new Date(year, month - 1, day);
            const formattedDay = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short'})
            console.log('Renderizando item do cronograma:', formattedDay, item);
            const isCompleted = item.status === 'completed';
            
            return (
              <TouchableOpacity
                key={`${item.date}-${index}`}
                onPress={() => onSelectActivity(item)}
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
          style={styles.buttonPrimary} 
          onPress={onChangePlan}>
                <Text style={styles.buttonText}>
                    Alterar Exercícios
                </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}