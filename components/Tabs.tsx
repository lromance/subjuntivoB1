import React from 'react';
import { ExerciseId, LEVELS } from '../types';

interface TabsProps {
    activeTab: ExerciseId;
    onTabChange: (tabId: ExerciseId) => void;
    userLevel: number;
}

const TABS: { id: ExerciseId, label: string }[] = [
    { id: 'ejercicio1', label: '1. Forma N1' },
    { id: 'ejercicio2', label: '2. Forma N2' },
    { id: 'ejercicio3', label: '3. Contraste' },
    { id: 'ejercicio4', label: '4. Disparadores N1' },
    { id: 'ejercicio5', label: '5. Disparadores N2' },
    { id: 'ejercicio6', label: '6. Ordenar Frase' },
    { id: 'ejercicio7', label: '7. Identificar Error' },
];

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-70" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a3 3 0 00-3 3v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2h-1V5a3 3 0 00-3-3zm-1 4V5a1 1 0 112 0v1H9z" clipRule="evenodd" />
    </svg>
);


const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, userLevel }) => {
    const currentLevelInfo = LEVELS.find(level => level.levelNumber === userLevel);
    const unlockedExercises = currentLevelInfo ? currentLevelInfo.availableExercises : [];

    return (
        <div className="-mb-px border-b-2 border-gray-200">
            <nav className="flex flex-wrap -mb-px px-2">
                {TABS.map(tab => {
                    const isLocked = !unlockedExercises.includes(tab.id);
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !isLocked && onTabChange(tab.id)}
                            disabled={isLocked}
                            className={`flex items-center py-4 px-4 text-sm sm:text-base border-b-4 transition duration-150 ${
                                activeTab === tab.id
                                    ? 'border-blue-600 text-blue-700 font-bold'
                                    : 'border-transparent text-gray-600'
                            } ${
                                isLocked 
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'hover:text-blue-700'
                            }`}
                        >
                            {tab.label}
                            {isLocked && <LockIcon />}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Tabs;