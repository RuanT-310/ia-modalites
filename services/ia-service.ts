import { EXERCISE_CATALOG } from "../data";
import { ScheduleItem, UserProfile } from "../types";

const iaUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
export const generateSchedule = async (profile: UserProfile): Promise<ScheduleItem[]> => {
  console.log('Exercícios adequados encontrados:');
  const suitableExercises = EXERCISE_CATALOG.filter(ex => 
    !ex.contraindications.some(contra => profile.restrictions.includes(contra))
  );
  const prompt = `Você é um especialista em fitness para idosos. Com base no perfil abaixo, crie um cronograma de exercícios para os próximos 7 dias. Use o fuso horário UTC (YYYY-MM-DD) para as datas.

PERFIL DO USUÁRIO:
- Idade: ${profile.age} anos
- Restrições: ${profile.restrictions.join(', ') || 'Nenhuma'}
- Dias disponíveis: ${profile.availability.days.join(', ')}
- Horário preferido: ${profile.availability.time}

EXERCÍCIOS DISPONÍVEIS (IDs):
${suitableExercises.map(ex => `${ex.id}: ${ex.title} (${ex.category}, ${ex.intensity})`).join('\n')}

REGRAS:
0. O cronograma deve cobrir os próximos 7 dias a partir de hoje dia ${new Date().toISOString().split('T')[0]}.
1. Apenas agende exercícios nos dias disponíveis do usuário
2. Varie os tipos de exercício (cardio, strength, flexibility)
3. Não repita o mesmo exercício em dias consecutivos
4. Priorize exercícios de baixa intensidade
5. Respeite as contraindicações

Retorne APENAS um JSON array válido neste formato (sem markdown) e use o calendario brasileiro como fuso horário:
[{"date":"2025-12-06","exerciseId":"ex_001"},{"date":"2025-12-08","exerciseId":"ex_002"}]`;

  try {
    const response = await fetch(iaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json" 
        }
      })
    });

    const data = await response.json();
    console.log('Resposta bruta da IA:', data);
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = textContent.replace(/```json|```/g, '').trim();
    const schedule = JSON.parse(cleanJson);
    
    console.log('Resposta da IA:', schedule, profile);
    return schedule.map((item: any) => ({
      ...item,
      status: 'pending' as const
    }));
  } catch (error) {
    console.error('Erro ao gerar cronograma:', error);
    return [];
  }
};
