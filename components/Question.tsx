import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, ExerciseId, ExerciseType } from '../types';

interface SentenceOrdererProps {
    shuffledWords: string[];
    isSubmitted: boolean;
    onAnswerChange: (answer: string) => void;
}

const SentenceOrderer: React.FC<SentenceOrdererProps> = ({ shuffledWords, isSubmitted, onAnswerChange }) => {
    const [builtSentence, setBuiltSentence] = useState<string[]>([]);
    const [wordBank, setWordBank] = useState<string[]>([]);

    useEffect(() => {
        setBuiltSentence([]);
        setWordBank(shuffledWords || []);
    }, [shuffledWords]);

    const handleAnswerChangeCallback = useCallback(onAnswerChange, [onAnswerChange]);

    useEffect(() => {
        handleAnswerChangeCallback(builtSentence.join(' '));
    }, [builtSentence, handleAnswerChangeCallback]);

    const handleWordBankClick = (word: string, index: number) => {
        if (isSubmitted) return;
        setBuiltSentence(prev => [...prev, word]);
        setWordBank(prev => prev.filter((_, i) => i !== index));
    };

    const handleAnswerClick = (word: string, index: number) => {
        if (isSubmitted) return;
        setWordBank(prev => [...prev, word]);
        setBuiltSentence(prev => prev.filter((_, i) => i !== index));
    };
    
    return (
        <div className="mt-4 space-y-4">
            <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg min-h-[50px] bg-white flex flex-wrap gap-2 items-center">
                 {builtSentence.length === 0 && <span className="text-gray-400 italic">Construye la frase aquí...</span>}
                 {builtSentence.map((word, index) => (
                    <button key={index} onClick={() => handleAnswerClick(word, index)} disabled={isSubmitted} className="px-3 py-1 bg-blue-200 text-blue-800 font-semibold rounded-md shadow-sm hover:bg-blue-300 transition-colors disabled:cursor-not-allowed">
                        {word}
                    </button>
                 ))}
            </div>
             <div className="p-3 border rounded-lg min-h-[50px] bg-gray-100 flex flex-wrap gap-2 items-center">
                 {wordBank.map((word, index) => (
                    <button key={index} onClick={() => handleWordBankClick(word, index)} disabled={isSubmitted} className="px-3 py-1 bg-white text-gray-800 font-semibold rounded-md shadow-sm border border-gray-300 hover:bg-gray-200 transition-colors disabled:cursor-not-allowed">
                        {word}
                    </button>
                 ))}
            </div>
        </div>
    );
};


interface QuestionProps {
    exerciseId: ExerciseId;
    index: number;
    question: Exercise;
    type: ExerciseType;
    userAnswer: string;
    isSubmitted: boolean;
    isCorrect?: boolean;
    onAnswerChange: (index: number, answer: string) => void;
}

const Question: React.FC<QuestionProps> = ({ exerciseId, index, question, type, userAnswer, isSubmitted, isCorrect, onAnswerChange }) => {
    
    const getVerbForPlaceholder = () => {
        if (question.verb) {
            const matches = question.verb.match(/\((.*?)\)/);
            if (matches) {
                const parts = matches[1].split(',').map(p => p.trim());
                return parts[parts.length - 1];
            }
            return question.verb;
        }
        return 'Verbo';
    }

    const containerClasses = [
        'p-4', 'bg-gray-50', 'rounded-xl', 'shadow-inner', 'transition-colors', 'duration-300',
        isSubmitted ? (isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500') : ''
    ].join(' ');

    return (
        <div className={containerClasses}>
            <div className="text-base font-medium text-gray-800 mb-1 flex items-center flex-wrap">
                <span className="mr-2">{index + 1}.</span>
                
                {type === 'input' && question.sentence && question.sentence.includes('__________') ? (
                    <>
                        <span dangerouslySetInnerHTML={{ __html: question.sentence.split('__________')[0] }} />
                        <input
                            type="text"
                            placeholder={getVerbForPlaceholder()}
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(index, e.target.value)}
                            disabled={isSubmitted}
                            className={`input-styled mx-2 ${isSubmitted && !isCorrect ? 'incorrect' : ''}`}
                        />
                        <span dangerouslySetInnerHTML={{ __html: question.sentence.split('__________')[1] || '' }} />
                    </>
                ) : type === 'input' ? (
                     <>
                        <span dangerouslySetInnerHTML={{ __html: `Conjugación de <strong>${question.verb}</strong>:` }} />
                        <input
                            type="text"
                            placeholder={getVerbForPlaceholder()}
                            value={userAnswer}
                            onChange={(e) => onAnswerChange(index, e.target.value)}
                            disabled={isSubmitted}
                            className={`input-styled mx-2 ${isSubmitted && !isCorrect ? 'incorrect' : ''}`}
                        />
                     </>
                ) : (
                    <span dangerouslySetInnerHTML={{ __html: question.sentence || `Conjugación de <strong>${question.verb}</strong>:` }} />
                )}
            </div>

            {type === 'radio' && question.shuffledOptions && (
                <div className="space-y-2 mt-2">
                    {question.shuffledOptions.map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center space-x-3 text-gray-700 cursor-pointer p-2 hover:bg-white rounded-md transition duration-150">
                            <input
                                type="radio"
                                name={`${exerciseId}-q${index}`}
                                value={option}
                                checked={userAnswer === option}
                                onChange={(e) => onAnswerChange(index, e.target.value)}
                                disabled={isSubmitted}
                                className="text-blue-600 focus:ring-blue-500 h-5 w-5"
                            />
                            <span className={isSubmitted && !isCorrect && userAnswer === option ? 'line-through text-red-500' : ''}>
                                {option}
                            </span>
                        </label>
                    ))}
                </div>
            )}
            
            {type === 'ordering' && question.shuffledWords && (
                <SentenceOrderer
                    shuffledWords={question.shuffledWords}
                    isSubmitted={isSubmitted}
                    onAnswerChange={(answer) => onAnswerChange(index, answer)}
                />
            )}


            {isSubmitted && (
                <div className="mt-2 text-sm font-medium">
                    {isCorrect ? (
                        <span className="text-emerald-600 font-bold">✅ ¡Correcto!</span>
                    ) : (
                        <>
                            <span className="text-red-500 font-bold">❌ Incorrecto. </span>
                            <span className="text-gray-600">La respuesta correcta es: <strong>{question.answer}</strong>.</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Question;