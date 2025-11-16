import React from 'react';

type MainView = 'ejercicios' | 'tutor';

interface MainTabsProps {
    activeView: MainView;
    onViewChange: (view: MainView) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ activeView, onViewChange }) => {
    const getButtonClasses = (view: MainView) => {
        const baseClasses = "flex-1 text-center py-4 px-6 font-kalam font-bold text-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
        if (activeView === view) {
            return `${baseClasses} bg-blue-600 text-white shadow-lg rounded-t-lg`;
        }
        return `${baseClasses} bg-white text-blue-500 hover:bg-blue-50 rounded-t-lg`;
    };

    return (
        <div className="flex mb-4 shadow-md rounded-t-lg overflow-hidden">
            <button onClick={() => onViewChange('ejercicios')} className={getButtonClasses('ejercicios')}>
                Ejercicios
            </button>
            <button onClick={() => onViewChange('tutor')} className={getButtonClasses('tutor')}>
                Tutor IA
            </button>
        </div>
    );
};

export default MainTabs;