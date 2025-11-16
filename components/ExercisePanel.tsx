
import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseId, ExerciseResult, ExerciseConfig } from '../types';
import Question from './Question';

interface ExercisePanelProps {
    id: ExerciseId;
    config: ExerciseConfig;
    questions: Exercise[];
    result: ExerciseResult | null;
    onCheck: (exerciseId: ExerciseId, answers: Record<number, string>) => void;
    onGenerate: () => void;
}

const ExercisePanel: React.FC<ExercisePanelProps> = ({ id, config, questions, result, onCheck, onGenerate }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        // Reset answers when new questions are generated
        setUserAnswers({});
    }, [questions]);
    
    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleCheck = () => {
        onCheck(id, userAnswers);
    };

    const OverallFeedback: React.FC = () => {
        if (!result || !result.isSubmitted) return null;

        let bgColor, textColor, message;
        if (result.correctCount === result.total) {
            bgColor = 'bg-green-100';
            textColor = 'text-green-800';
            message = `🎉 ¡Excelente! ${result.correctCount} de ${result.total} correctas. ¡Sigue así!`;
        } else if (result.correctCount > 0) {
            bgColor = 'bg-yellow-100';
            textColor = 'text-yellow-800';
            message = `¡Buen trabajo! Has acertado ${result.correctCount} de ${result.total}. Revisa tus errores.`;
        } else {
            bgColor = 'bg-red-100';
            textColor = 'text-red-800';
            message = `Sigue practicando. Has acertado 0 de ${result.total}. Mira las respuestas correctas.`;
        }

        return (
            <div className={`mt-6 p-4 rounded-xl text-lg font-medium ${bgColor} ${textColor}`}>
                {message}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="font-kalam text-3xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">{config.title}</h2>
            <p className="text-gray-700">{config.description}</p>
            
            <div className="space-y-5">
                {questions.map((q, index) => (
                    <Question
                        key={index}
                        exerciseId={id}
                        index={index}
                        question={q}
                        type={config.type}
                        userAnswer={userAnswers[index] || ''}
                        isSubmitted={result?.isSubmitted || false}
                        isCorrect={result?.results[index]}
                        onAnswerChange={handleAnswerChange}
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
                <button 
                    onClick={handleCheck} 
                    disabled={result?.isSubmitted}
                    className="btn-primary flex-1 sm:flex-auto"
                >
                    Corregir
                </button>
                <button 
                    onClick={onGenerate} 
                    className="btn-secondary flex-1 sm:flex-auto"
                >
                    Generar Nuevas
                </button>
            </div>
            
            <OverallFeedback />
        </div>
    );
};

export default ExercisePanel;