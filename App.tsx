import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExerciseResult, SessionScores, Attempt, ExerciseId, EXERCISE_CONFIG, ExerciseConfig, LEVELS } from './types';
import { generateQuestions } from './services/exerciseService';
import { getAIFeedback } from './services/geminiService';
import Header from './components/Header';
import AiFeedback from './components/AiFeedback';
import Tabs from './components/Tabs';
import ExercisePanel from './components/ExercisePanel';
import MainTabs from './components/MainTabs';
import Tutor from './components/Tutor';

const initialScores: SessionScores = {
    ejercicio1: { correct: 0, attempted: 0 },
    ejercicio2: { correct: 0, attempted: 0 },
    ejercicio3: { correct: 0, attempted: 0 },
    ejercicio4: { correct: 0, attempted: 0 },
    ejercicio5: { correct: 0, attempted: 0 },
    ejercicio6: { correct: 0, attempted: 0 },
    ejercicio7: { correct: 0, attempted: 0 },
};

const initialQuestions: Record<ExerciseId, Exercise[]> = {
    ejercicio1: [],
    ejercicio2: [],
    ejercicio3: [],
    ejercicio4: [],
    ejercicio5: [],
    ejercicio6: [],
    ejercicio7: [],
};

const initialResults: Record<ExerciseId, ExerciseResult | null> = {
    ejercicio1: null,
    ejercicio2: null,
    ejercicio3: null,
    ejercicio4: null,
    ejercicio5: null,
    ejercicio6: null,
    ejercicio7: null,
};


const App: React.FC = () => {
    const [mainView, setMainView] = useState<'ejercicios' | 'tutor'>('ejercicios');
    const [activeTab, setActiveTab] = useState<ExerciseId>('ejercicio1');
    const [currentQuestions, setCurrentQuestions] = useState(initialQuestions);
    const [sessionScores, setSessionScores] = useState(initialScores);
    const [exerciseResults, setExerciseResults] = useState(initialResults);
    const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
    const [aiFeedback, setAiFeedback] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

    // Leveling System State
    const [userLevel, setUserLevel] = useState<number>(1);
    const [totalCorrectAnswers, setTotalCorrectAnswers] = useState<number>(0);

    // Load progress from localStorage on initial mount
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem('subjunctiveAppProgress');
            if (savedProgress) {
                const { level, totalCorrect } = JSON.parse(savedProgress);
                setUserLevel(level || 1);
                setTotalCorrectAnswers(totalCorrect || 0);
            }
        } catch (error) {
            console.error("Failed to load progress from localStorage", error);
        }
    }, []);

    // Check for level up whenever correct answers increase
    useEffect(() => {
        const nextLevelInfo = LEVELS.find(l => l.levelNumber === userLevel + 1);
        
        if (nextLevelInfo && totalCorrectAnswers >= nextLevelInfo.unlockThreshold) {
            setUserLevel(userLevel + 1);
        }

        // Save progress to localStorage
        try {
            const progress = JSON.stringify({ level: userLevel, totalCorrect: totalCorrectAnswers });
            localStorage.setItem('subjunctiveAppProgress', progress);
        } catch (error) {
            console.error("Failed to save progress to localStorage", error);
        }
    }, [totalCorrectAnswers, userLevel]);
    
    // Cheat code to unlock levels for testing
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.altKey && event.key === 'l') {
                event.preventDefault();
                console.log("Cheat activated: Unlocking all levels.");
                setUserLevel(5); // Set to max level
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    const handleGenerateExercise = useCallback((exerciseId: ExerciseId) => {
        const config = EXERCISE_CONFIG[exerciseId];
        const newQuestions = generateQuestions(config.pool, 5, config.type);
        setCurrentQuestions(prev => ({ ...prev, [exerciseId]: newQuestions }));
        setExerciseResults(prev => ({...prev, [exerciseId]: null}));
    }, []);

    useEffect(() => {
        handleGenerateExercise('ejercicio1');
    }, [handleGenerateExercise]);

    const handleTabChange = useCallback((tabId: ExerciseId) => {
        setActiveTab(tabId);
        if (currentQuestions[tabId].length === 0) {
            handleGenerateExercise(tabId);
        }
    }, [currentQuestions, handleGenerateExercise]);

    const handleCheckExercise = (exerciseId: ExerciseId, userAnswers: Record<number, string>) => {
        const questions = currentQuestions[exerciseId];
        if (!questions || questions.length === 0) return;

        let correctCount = 0;
        const newAttempts: Attempt[] = [];
        const individualResults: { [key: number]: boolean } = {};

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index] || 'No respondió';
            const cleanedUserAnswer = (userAnswer || '').toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").replace(/\s+/g, '');
            const isCorrect = q.cleanedAnswer === cleanedUserAnswer;
            
            if (isCorrect) {
                correctCount++;
            }
            individualResults[index] = isCorrect;
            
            newAttempts.push({
                exerciseId: exerciseId,
                type: EXERCISE_CONFIG[exerciseId].type,
                question: q.sentence || q.verb || q.answer,
                userAnswer: userAnswer,
                correctAnswer: q.answer,
                isCorrect: isCorrect,
                timestamp: Date.now()
            });
        });

        setAllAttempts(prev => [...prev, ...newAttempts]);
        setSessionScores(prev => ({
            ...prev,
            [exerciseId]: {
                correct: prev[exerciseId].correct + correctCount,
                attempted: prev[exerciseId].attempted + questions.length,
            }
        }));
        setExerciseResults(prev => ({
            ...prev,
            [exerciseId]: {
                correctCount,
                total: questions.length,
                results: individualResults,
                isSubmitted: true
            }
        }));
        setTotalCorrectAnswers(prev => prev + correctCount);
    };

    const handleRequestAIFeedback = async () => {
        setIsAiLoading(true);
        setAiFeedback('');
        try {
            const feedback = await getAIFeedback(allAttempts);
            setAiFeedback(feedback);
        } catch (error) {
            console.error("Error getting AI feedback:", error);
            setAiFeedback('Hubo un error al conectar con el tutor IA. Inténtalo de nuevo.');
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div id="app-shell">
            <MainTabs activeView={mainView} onViewChange={setMainView} />

            {mainView === 'ejercicios' ? (
                <>
                    <Header 
                        scores={sessionScores} 
                        userLevel={userLevel}
                        totalCorrectAnswers={totalCorrectAnswers}
                    />
                    
                    <AiFeedback 
                        onGetFeedback={handleRequestAIFeedback}
                        feedback={aiFeedback}
                        isLoading={isAiLoading}
                        attempts={allAttempts}
                    />
                    
                    <div className="app-container mt-8">
                        <Tabs activeTab={activeTab} onTabChange={handleTabChange} userLevel={userLevel}/>
                        <main className="pt-6">
                            {Object.keys(EXERCISE_CONFIG).map(key => {
                                const exerciseId = key as ExerciseId;
                                const config: ExerciseConfig = EXERCISE_CONFIG[exerciseId];
                                return (
                                    <div key={exerciseId} className={activeTab === exerciseId ? '' : 'hidden'}>
                                       <ExercisePanel
                                            id={exerciseId}
                                            config={config}
                                            questions={currentQuestions[exerciseId]}
                                            result={exerciseResults[exerciseId]}
                                            onCheck={handleCheckExercise}
                                            onGenerate={() => handleGenerateExercise(exerciseId)}
                                        />
                                    </div>
                                );
                            })}
                        </main>
                    </div>
                </>
            ) : (
                <Tutor />
            )}
            
            <footer className="text-center mt-8 text-gray-500 text-sm">
                Hecho con ❤️ para estudiantes de español. | Potenciado por Gemini (2025)
            </footer>
        </div>
    );
};

export default App;