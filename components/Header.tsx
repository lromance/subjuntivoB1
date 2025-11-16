
import React from 'react';
import { SessionScores, ExerciseId, LEVELS } from '../types';

interface ScoreBoxProps {
    label: string;
    score: { correct: number; attempted: number };
}

const ScoreBox: React.FC<ScoreBoxProps> = ({ label, score }) => (
    <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl shadow-md">
        <span className="text-sm font-medium text-gray-700 block">{label}</span>
        <span className="text-2xl font-bold text-blue-600">{score.correct} / {score.attempted}</span>
    </div>
);

interface HeaderProps {
    scores: SessionScores;
    userLevel: number;
    totalCorrectAnswers: number;
}

const Header: React.FC<HeaderProps> = ({ scores, userLevel, totalCorrectAnswers }) => {
    const scoreLabels: Record<ExerciseId, string> = {
        ejercicio1: 'Forma N1',
        ejercicio2: 'Forma N2',
        ejercicio3: 'Contraste',
        ejercicio4: 'Dispar. N1',
        ejercicio5: 'Dispar. N2',
        ejercicio6: 'Ordenar',
        ejercicio7: 'Errores',
    };
    
    const currentLevelInfo = LEVELS.find(l => l.levelNumber === userLevel) || LEVELS[0];
    const nextLevelInfo = LEVELS.find(l => l.levelNumber === userLevel + 1);

    const progressPercent = nextLevelInfo
        ? Math.max(0, Math.min(100,
            ((totalCorrectAnswers - currentLevelInfo.unlockThreshold) / (nextLevelInfo.unlockThreshold - currentLevelInfo.unlockThreshold)) * 100
          ))
        : 100;

    return (
        <header className="app-container mb-8">
            <h1 className="font-kalam text-4xl text-center font-bold text-blue-800 mb-2">Plataforma de Práctica: Subjuntivo B1</h1>
            <p className="text-lg text-gray-600 text-center">Ejercicios esenciales para la ciudadanía y la vida diaria. ¡Con feedback personalizado de IA!</p>
            
            <div className="mt-6 pt-4 border-t border-blue-100">
                 <h3 className="text-lg font-semibold text-blue-700 mb-3">Progreso General</h3>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">
                        {userLevel}
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-blue-700">{currentLevelInfo.title}</span>
                             {nextLevelInfo && (
                                <span className="text-xs font-medium text-gray-500">
                                    Siguiente nivel en {Math.max(0, nextLevelInfo.unlockThreshold - totalCorrectAnswers)} pts
                                </span>
                            )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-100">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">Puntuación de la Sesión</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
                    {Object.keys(scores).map(key => (
                        <ScoreBox
                            key={key}
                            label={scoreLabels[key as ExerciseId]}
                            score={scores[key as ExerciseId]}
                        />
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;