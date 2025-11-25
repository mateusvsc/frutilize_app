import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!formData.username || !formData.password) {
        Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }

      if (!isLogin && !formData.email) {
        Alert.alert('Erro', 'Por favor, informe seu email');
        return;
      }

      if (isLogin) {
        await login(formData.username, formData.password);
      } else {
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      Alert.alert('Sucesso', `Bem-vindo, ${formData.username}!`);
      router.replace('/(tabs)');
      
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🍎 Frutilize
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            {isLogin ? 'Faça login em sua conta' : 'Crie sua conta'}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Nome de usuário *
            </ThemedText>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
              placeholder="Digite seu username"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Email *
              </ThemedText>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={styles.label}>
              Senha *
            </ThemedText>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Confirmar Senha *
              </ThemedText>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirme sua senha"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                {isLogin ? 'Entrar' : 'Cadastrar'}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
          >
            <ThemedText style={styles.switchModeText}>
              {isLogin 
                ? 'Não tem uma conta? Cadastre-se' 
                : 'Já tem uma conta? Faça login'
              }
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.demoCredentials}>
            <ThemedText type="defaultSemiBold" style={styles.demoTitle}>
              Credenciais de Demonstração:
            </ThemedText>
            <ThemedText style={styles.demoText}>
              Usuário: admin
            </ThemedText>
            <ThemedText style={styles.demoText}>
              Senha: 0406
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchModeButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  switchModeText: {
    color: '#2E8B57',
    fontSize: 14,
  },
  demoCredentials: {
    marginTop: 30,
    padding: 20,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    borderRadius: 8,
  },
  demoTitle: {
    marginBottom: 8,
    fontSize: 14,
  },
  demoText: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
});