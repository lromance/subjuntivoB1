export type ExerciseId = 'ejercicio1' | 'ejercicio2' | 'ejercicio3' | 'ejercicio4' | 'ejercicio5' | 'ejercicio6' | 'ejercicio7';
export type ExerciseType = 'radio' | 'input' | 'ordering';
export type QuestionPool = 'formaPura' | 'disparadores' | 'contraste' | 'ordenarFrase' | 'identificarError';

export interface Exercise {
    verb?: string;
    sentence?: string;
    answer: string;
    cleanedAnswer: string;
    shuffledOptions?: string[];
    words?: string[];
    shuffledWords?: string[];
    options?: string[];
}

export type SessionScores = Record<ExerciseId, { correct: number; attempted: number }>;
export type ExerciseResults = Record<ExerciseId, ExerciseResult | null>;

export interface ExerciseResult {
    correctCount: number;
    total: number;
    results: { [key: number]: boolean };
    isSubmitted: boolean;
}

export interface Attempt {
    exerciseId: ExerciseId;
    type: ExerciseType;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timestamp: number;
}

export interface ExerciseConfig {
    title: string;
    description: string;
    type: ExerciseType;
    pool: QuestionPool;
}

export interface Level {
    levelNumber: number;
    title: string;
    unlockThreshold: number; // Total correct answers needed to unlock
    availableExercises: ExerciseId[];
}

export const LEVELS: Level[] = [
    { levelNumber: 1, title: "Nivel 1: Fundamentos", unlockThreshold: 0, availableExercises: ['ejercicio1', 'ejercicio2'] },
    { levelNumber: 2, title: "Nivel 2: Contraste", unlockThreshold: 10, availableExercises: ['ejercicio1', 'ejercicio2', 'ejercicio3'] },
    { levelNumber: 3, title: "Nivel 3: Disparadores", unlockThreshold: 25, availableExercises: ['ejercicio1', 'ejercicio2', 'ejercicio3', 'ejercicio4', 'ejercicio5'] },
    { levelNumber: 4, title: "Nivel 4: Aplicación", unlockThreshold: 50, availableExercises: ['ejercicio1', 'ejercicio2', 'ejercicio3', 'ejercicio4', 'ejercicio5', 'ejercicio6'] },
    { levelNumber: 5, title: "Nivel 5: Maestría", unlockThreshold: 80, availableExercises: ['ejercicio1', 'ejercicio2', 'ejercicio3', 'ejercicio4', 'ejercicio5', 'ejercicio6', 'ejercicio7'] },
];

export const EXERCISE_CONFIG: Record<ExerciseId, ExerciseConfig> = {
    ejercicio1: {
        title: '1. La Forma (Nivel 1): Elegir',
        description: 'Elige la conjugación pura del presente de subjuntivo (incluye irregulares clave).',
        type: 'radio',
        pool: 'formaPura'
    },
    ejercicio2: {
        title: '2. La Forma (Nivel 2): Escribir',
        description: 'Escribe la conjugación pura del presente de subjuntivo. ¡Cuidado con la ortografía!',
        type: 'input',
        pool: 'formaPura'
    },
    ejercicio3: {
        title: '3. El Contraste: Indicativo vs. Subjuntivo',
        description: 'Elige la opción correcta. ¿Se usa Indicativo (certeza) o Subjuntivo (duda, deseo, irrealidad)?',
        type: 'radio',
        pool: 'contraste'
    },
    ejercicio4: {
        title: '4. Disparadores (Nivel 1): Elegir',
        description: 'Identifica la forma correcta (subjuntivo) después de verbos de influencia, deseo o duda.',
        type: 'radio',
        pool: 'disparadores'
    },
    ejercicio5: {
        title: '5. Disparadores (Nivel 2): Escribir',
        description: 'Completa la frase con el presente de subjuntivo del verbo entre paréntesis.',
        type: 'input',
        pool: 'disparadores'
    },
    ejercicio6: {
        title: '6. Ordenar la Frase',
        description: 'Construye una frase gramaticalmente correcta usando las palabras provistas.',
        type: 'ordering',
        pool: 'ordenarFrase'
    },
    ejercicio7: {
        title: '7. Identificar el Error',
        description: 'Elige la frase que está escrita correctamente. ¡Presta atención al modo verbal!',
        type: 'radio',
        pool: 'identificarError'
    },
};
