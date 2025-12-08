import { ArrowLeft, Clock, CheckCircle } from "lucide-react-native";
import { ScrollView, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export function ActivityCard({ 
  getExerciseById, selectedActivity, setSelectedActivity, handleLogout, handleCompleteExercise 
}: any) {

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
}