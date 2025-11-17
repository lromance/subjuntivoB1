
import React from 'react';
import { Attempt } from '../types';
import Spinner from './Spinner';

interface AiFeedbackProps {
    onGetFeedback: () => void;
    feedback: string;
    isLoading: boolean;
    attempts: Attempt[];
}

const AiFeedback: React.FC<AiFeedbackProps> = ({ onGetFeedback, feedback, isLoading, attempts }) => {
    const hasErrors = attempts.some(att => !att.isCorrect);

    return (
        <div className="app-container mb-8">
            <h2 className="font-kalam text-3xl font-bold text-blue-800 mb-4">Análisis de Errores</h2>
            <p className="text-gray-600 mb-4">Cuando acumules errores, la IA detectará patrones y te dará consejos personalizados.</p>
            <button
                onClick={onGetFeedback}
                disabled={isLoading || !hasErrors}
                className="btn-primary w-full sm:w-auto"
            >
                {isLoading && <Spinner />}
                <span>{isLoading ? 'Analizando...' : 'Pedir Análisis a la IA'}</span>
            </button>

            {feedback && (
                <div className="mt-6 p-6 rounded-xl shadow-lg bg-white border-l-8 border-orange-500">
                    <p className="text-lg font-bold text-orange-600 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Tutor IA: Diagnóstico de Errores
                    </p>
                    <div
                        className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }}
                    />
                </div>
            )}
        </div>
    );
};

export default AiFeedback;