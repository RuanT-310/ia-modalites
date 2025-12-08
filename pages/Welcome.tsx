import { ChevronRight } from "lucide-react-native";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";
import { SafeAreaView } from "react-native-safe-area-context";

export function Welcome({ step, setStep, profile, setProfile }: any) {
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