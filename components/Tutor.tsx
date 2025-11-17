
import React, { useState } from 'react';
import { getTutorResponse } from '../services/geminiService';
import Spinner from './Spinner';

const SYSTEM_PROMPT = `
Eres un asistente amigable de gramática española para estudiantes de nivel B1.
Tu objetivo es ayudarles a practicar el Presente de Subjuntivo.
Tu tono debe ser simple, claro y muy animado.

REGLAS PRINCIPALES:
1.  FILOSOFÍA: El subjuntivo se usa para DESEOS, DUDAS, CONSEJOS, u opiniones. No se usa para declarar un hecho (eso es el indicativo). Tu feedback DEBE ser simple.
2.  VARIEDAD DE PERSONAS: ¡MUY IMPORTANTE! No uses siempre 'tú'. Debes variar la persona gramatical en tus ejercicios. Usa 'él', 'ella', 'nosotros', 'ellos', 'yo', etc.

MECANISMO DE EJERCITACIÓN:

FASE 1: CREAR TAREA (Tu rol: Tutor)
El usuario te da una "situación" (ej. "mis amigos quieren fiesta").
Tú creas un ejercicio de "completar el espacio" basado en la situación y la fase actual.
**Recuerda usar personas diferentes (no solo 'tú').**
Ejemplo:
- Usuario (Situación): "mis amigos quieren fiesta"
- Fase: "Deseo"
- Tu Respuesta (Tarea): "¡Buena idea! Completa la frase: Espero que mis amigos ________ (hacer) una fiesta increíble."
(Aquí usaste 'ellos', ¡perfecto!)
- SÉ BREVE. Solo crea la tarea.

FASE 2: CORREGIR TAREA (Tu rol: Corrector)
El usuario te enviará la Tarea que creaste Y su respuesta.
Tu DEBES:
1.  Decir "¡Correcto!" o "¡Casi!" o "Incorrecto".
2.  Dar la respuesta correcta.
3.  Explicar CORTITO por qué es subjuntivo (ej. '¡es un deseo!', '¡es una duda!', 'no es un hecho').
4.  Mencionar la regla (ej. verbos -AR usan -e, -ER/-IR usan -a).
5.  **IMPORTANTE: Usa etiquetas HTML simples (como <b> para negrita, <i> para cursiva, y <br> para saltos de línea) para dar formato a tu feedback. No uses Markdown.**
6.  SÉ MUY BREVE Y AMIGABLE.

CONFIGURACIÓN DE FASES (Simple):
- Fase 1 (Deseo): Foco: Expresar deseos. Palabras clave: "Ojalá que...", "Espero que...".
- Fase 2 (Consejo/Necesidad): Foco: Dar consejos o decir qué es necesario. Palabras clave: "Es importante que...", "Te aconsejo que...".
- Fase 3 (Duda/Incertidumbre): Foco: Expresar duda. Palabras clave: "No creo que...", "Es posible que...".
`;

const phaseConfig = {
    1: {
        title: "FASE I: DESEOS",
        description: "Usamos subjuntivo para expresar deseos. Son cosas que queremos, pero no son 100% seguras. Usaremos 'Ojalá que...' o 'Espero que...'.",
        prompt_task: "Escribe una situación simple sobre un deseo (ej. 'Mi amigo tiene un examen', 'El clima está feo').",
        matrix: "Ojalá que / Espero que"
    },
    2: {
        title: "FASE II: CONSEJOS Y NECESIDAD",
        description: "Usamos subjuntivo para dar consejos, órdenes o expresar necesidad. La acción no es un hecho, es una meta. Usaremos 'Es importante que...' o 'Te aconsejo que...'.",
        prompt_task: "Escribe una situación donde alguien necesita un consejo (ej. 'Mi hermano come mal', 'Un estudiante no estudia').",
        matrix: "Es importante que / Te aconsejo que"
    },
    3: {
        title: "FASE III: DUDAS",
        description: "Usamos subjuntivo para expresar duda. Si no estás seguro, usas subjuntivo. (Certeza: 'Creo que es...' // Duda: 'No creo que sea...').",
        prompt_task: "Escribe una situación sobre la que tengas dudas (ej. 'Juan vendrá a la fiesta', 'Mi jefe está en la oficina').",
        matrix: "No creo que / Es posible que"
    }
};

type Screen = 'welcome' | 'task_input' | 'feedback_input' | 'result' | 'complete';

const Tutor: React.FC = () => {
    const [currentPhase, setCurrentPhase] = useState(1);
    const [screen, setScreen] = useState<Screen>('welcome');
    const [userSituation, setUserSituation] = useState('');
    const [generatedTask, setGeneratedTask] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [aiFeedback, setAiFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTask = async () => {
        if (!userSituation.trim()) {
            setError("Por favor, introduce una situación para continuar.");
            return;
        }
        setError(null);
        setIsLoading(true);

        const phase = phaseConfig[currentPhase as keyof typeof phaseConfig];
        const userQuery = `
            Fase Actual: ${phase.title} (Palabras clave: ${phase.matrix})
            Rol: Tutor (Crea una tarea)
            Situación del Usuario: "${userSituation}"
            ---
            Genera el ejercicio de "completar el espacio" AHORA. Recuerda variar la persona gramatical. Sé breve.
        `;

        try {
            const task = await getTutorResponse(SYSTEM_PROMPT, userQuery);
            setGeneratedTask(task);
            setScreen('feedback_input');
        } catch (e) {
            setError(`Error de la IA: ${(e as Error).message}. Inténtalo de nuevo.`);
            setScreen('task_input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCorrectTask = async () => {
        if (!userAnswer.trim()) {
            setError("Por favor, escribe tu respuesta al ejercicio.");
            return;
        }
        setError(null);
        setIsLoading(true);

        const phase = phaseConfig[currentPhase as keyof typeof phaseConfig];
        const userQuery = `
            Fase Actual: ${phase.title}
            Rol: Corrector (Da feedback)
            ---
            Tarea Original: "${generatedTask}"
            Respuesta del Usuario: "${userAnswer}"
            ---
            Evalúa la respuesta. Da feedback simple (nivel B1) usando <b>, <i>, <br>.
        `;

        try {
            const feedback = await getTutorResponse(SYSTEM_PROMPT, userQuery);
            setAiFeedback(feedback);
            setScreen('result');
        } catch (e) {
            setError(`Error de la IA: ${(e as Error).message}. Inténtalo de nuevo.`);
            setScreen('feedback_input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNextPhase = () => {
        const totalPhases = Object.keys(phaseConfig).length;
        if (currentPhase < totalPhases) {
            setCurrentPhase(p => p + 1);
            setScreen('task_input');
            setUserSituation('');
            setGeneratedTask('');
            setUserAnswer('');
            setAiFeedback('');
            setError(null);
        } else {
            setScreen('complete');
        }
    };

    const handleRestart = () => {
        setCurrentPhase(1);
        setScreen('welcome');
        setUserSituation('');
        setGeneratedTask('');
        setUserAnswer('');
        setAiFeedback('');
        setError(null);
    };


    const renderContent = () => {
        const phase = phaseConfig[currentPhase as keyof typeof phaseConfig];
        
        switch (screen) {
            case 'welcome':
                return (
                    <div className="text-center">
                        <p className="mb-8 text-lg text-gray-700">Vamos a practicar el subjuntivo en 3 situaciones comunes: Deseos, Consejos y Dudas.</p>
                        <button onClick={() => setScreen('task_input')} className="btn-primary">EMPEZAR FASE I</button>
                    </div>
                );
            case 'task_input':
                return (
                    <>
                        <h2 className="phase-title mb-4 text-center">{phase.title}</h2>
                        <p className="mb-6 text-gray-700 text-center">{phase.description}</p>
                        <label htmlFor="situation-input" className="block mb-2 font-semibold text-gray-800">{phase.prompt_task}</label>
                        <textarea id="situation-input" className="input-primary" rows={3} placeholder="Escribe tu situación aquí..." value={userSituation} onChange={e => setUserSituation(e.target.value)} />
                        <div className="text-center">
                            <button onClick={handleGenerateTask} disabled={isLoading} className="btn-primary mt-4">GENERAR EJERCICIO</button>
                        </div>
                    </>
                );
            case 'feedback_input':
                return (
                    <>
                        <h2 className="phase-title mb-4 text-center">{phase.title}</h2>
                        <p className="mb-2 font-semibold">Tu situación:</p>
                        <p className="mb-4 p-3 bg-gray-50 border rounded-lg text-gray-800">"{userSituation}"</p>
                        <hr className="my-6 border-gray-200" />
                        <label htmlFor="answer-input" className="block mb-3 font-semibold text-gray-800">Tarea del Tutor (IA):</label>
                        <div className="ai-feedback">
                            <p dangerouslySetInnerHTML={{ __html: generatedTask.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                        <textarea id="answer-input" className="input-primary mt-4" rows={3} placeholder="Escribe tu respuesta completa aquí..." value={userAnswer} onChange={e => setUserAnswer(e.target.value)} />
                        <div className="text-center">
                            <button onClick={handleCorrectTask} disabled={isLoading} className="btn-primary mt-4">CORREGIR MI RESPUESTA</button>
                        </div>
                    </>
                );
            case 'result':
                const isLastPhase = currentPhase === Object.keys(phaseConfig).length;
                return (
                    <>
                        <h2 className="phase-title mb-4 text-center">{phase.title}</h2>
                        <p className="mb-2 font-semibold">Tu respuesta:</p>
                        <p className="mb-4 p-3 bg-gray-50 border rounded-lg text-gray-800">"{userAnswer}"</p>
                        <hr className="my-6 border-gray-200" />
                        <p className="mb-3 font-semibold text-gray-800">Feedback del Tutor (IA):</p>
                        <div className="ai-feedback" dangerouslySetInnerHTML={{ __html: aiFeedback }} />
                        <div className="text-center">
                            <button onClick={handleNextPhase} className="btn-primary mt-6">{isLastPhase ? "FINALIZAR TUTORIAL" : "SIGUIENTE FASE"}</button>
                        </div>
                    </>
                );
            case 'complete':
                return (
                    <div className="text-center">
                        <h2 className="phase-title text-3xl mb-4 text-blue-700">¡FELICIDADES!</h2>
                        <p className="mb-6 text-lg text-gray-700">Has completado las tres fases. Has practicado Deseos, Consejos y Dudas.</p>
                        <p className="mb-8">Sigue practicando. Recuerda: si no es un hecho 100% seguro, ¡probablemente es subjuntivo!</p>
                        <button onClick={handleRestart} className="btn-primary">REINICIAR TUTORIAL</button>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div id="tutor-view">
            <div className="app-container max-w-3xl mx-auto p-6 md:p-10">
                <header className="text-center mb-8">
                    <h1 className="font-kalam text-4xl md:text-5xl font-bold text-blue-700">Tutor de Subjuntivo</h1>
                    <p className="text-lg text-gray-600 mt-2">Nivel B1: ¡Practica como en tu cuaderno!</p>
                </header>

                {isLoading && (
                    <div className="text-center p-10">
                        <div className="loader mx-auto"></div>
                        <p className="mt-4 text-gray-600">La IA está pensando...</p>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                        <strong className="font-bold">¡Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}
                
                {!isLoading && (
                    <main>{renderContent()}</main>
                )}
            </div>
        </div>
    );
};

export default Tutor;