import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { View, TouchableOpacity, TextInput, Text } from "react-native";

export function SelectAge({ step, setStep, profile, setProfile }: any) {
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