import { Exercise } from "./types";

export const EXERCISE_CATALOG: Exercise[] = [
  {
    id: 'ex_001',
    title: 'Caminhada Leve',
    category: 'cardio',
    durationMin: 20,
    intensity: 'low',
    contraindications: [],
    description: '1. Encontre um local plano e seguro\n2. Use calçado confortável\n3. Caminhe em ritmo suave por 20 minutos\n4. Mantenha postura ereta\n5. Hidrate-se antes e depois'
  },
  {
    id: 'ex_002',
    title: 'Exercícios na Cadeira',
    category: 'strength',
    durationMin: 15,
    intensity: 'low',
    contraindications: [],
    description: '1. Sente-se em cadeira firme\n2. Elevação de braços (10x)\n3. Rotação de ombros (10x)\n4. Elevação de pernas alternadas (10x cada)\n5. Respire profundamente entre séries'
  },
  {
    id: 'ex_003',
    title: 'Alongamento Suave',
    category: 'flexibility',
    durationMin: 10,
    intensity: 'low',
    contraindications: [],
    description: '1. Alongue pescoço suavemente\n2. Estique braços acima da cabeça\n3. Rotação de punhos e tornozelos\n4. Alongue pernas sentado\n5. Nunca force além do confortável'
  },
  {
    id: 'ex_004',
    title: 'Yoga na Cadeira',
    category: 'flexibility',
    durationMin: 20,
    intensity: 'low',
    contraindications: ['knee_pain'],
    description: '1. Sente-se confortavelmente\n2. Respiração profunda (5 min)\n3. Torção suave do tronco\n4. Extensão lateral dos braços\n5. Meditação final (2 min)'
  },
  {
    id: 'ex_005',
    title: 'Hidroginástica',
    category: 'cardio',
    durationMin: 30,
    intensity: 'medium',
    contraindications: ['heart_condition'],
    description: '1. Entre na piscina com auxílio\n2. Aquecimento com movimentos leves\n3. Caminhada na água\n4. Movimentos de braços\n5. Resfriamento gradual'
  },
  {
    id: 'ex_006',
    title: 'Fortalecimento com Peso Leve',
    category: 'strength',
    durationMin: 15,
    intensity: 'medium',
    contraindications: ['back_pain'],
    description: '1. Use pesos de 0.5-1kg\n2. Bíceps (3 séries de 8)\n3. Elevação lateral (3 séries de 8)\n4. Descanso de 1 min entre séries\n5. Alongue após finalizar'
  }
];

