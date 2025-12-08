import { ArrowLeft } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View, TextInput, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export function Availability({ setStep, profile, setProfile, handleGenerateSchedule, handleDayToggle }: any) {
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