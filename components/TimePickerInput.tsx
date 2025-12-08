import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';

interface TimePickerProps {
  value: string; // Espera formato "HH:mm" ex: "08:00"
  onChange: (time: string) => void;
}

export function TimePickerInput({ value, onChange }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Converte a string "08:00" para um objeto Date para o picker entender
  const getCurrentDate = () => {
    const [hours, minutes] = value.split(':').map(Number);
    const date = new Date();
    date.setHours(hours || 0);
    date.setMinutes(minutes || 0);
    return date;
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // No Android, o picker fecha sozinho, então escondemos o modal
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event.type === 'set' && selectedDate) {
      // Formata de volta para string "HH:mm"
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange(`${hours}:${minutes}`);
    } else if (event.type === 'dismissed') {
       // Usuário cancelou
       setShowPicker(false);
    }
  };

  return (
    <View>
      {/* O Input Visual (Botão) */}
      <TouchableOpacity 
        style={styles.inputContainer} 
        onPress={() => setShowPicker(!showPicker)} // Toggle para iOS, Open para Android
      >
        <Text style={styles.inputText}>{value}</Text>
        <Clock size={20} color="#6B7280" />
      </TouchableOpacity>

      {/* O Componente Nativo (Lógica condicional por plataforma) */}
      {showPicker && (
        <DateTimePicker
          value={getCurrentDate()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          onChange={handleChange}
          style={styles.iosPicker} // Apenas para iOS
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  inputText: {
    fontSize: 24,
    color: '#111827',
  },
  iosPicker: {
    width: '100%',
    backgroundColor: 'white',
    marginTop: 8,
  }
});