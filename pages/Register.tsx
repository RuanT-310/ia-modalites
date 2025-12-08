import { ScrollView, View, TextInput, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles";

export function Register({ 
    setAuthStep, authError, setAuthError, registerForm, setRegisterForm, handleRegister
}: any) {
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