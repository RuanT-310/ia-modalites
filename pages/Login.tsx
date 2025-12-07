  import { SafeAreaView, ScrollView, View, TextInput, TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";

export function Login({ 
    authError, loginForm, setLoginForm, handleLogin, setAuthStep, setAuthError 
}: any ){
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