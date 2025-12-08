import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export function Restrictions({ setStep, profile, handleRestrictionToggle }: any) {
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