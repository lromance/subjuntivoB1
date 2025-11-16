import { questionBank, SUBJUNTIVO_MAP, INDICATIVO_MAP } from '../data/questions';
import { Exercise, QuestionPool, ExerciseType } from '../types';

const cleanAnswer = (answer: string | null | undefined): string => {
    if (!answer) return '';
    return answer.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").replace(/\s+/g, '');
};

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const getPersonIndex = (pronoun: string): number => {
    const p = pronoun.toLowerCase().trim();
    if (p.includes('yo')) return 0;
    if (p.includes('tú')) return 1;
    // Check for plural "ustedes" BEFORE singular "usted" to avoid misidentification.
    if (p.includes('ellos') || p.includes('ellas') || p.includes('ustedes')) return 5;
    if (p.includes('él') || p.includes('ella') || p.includes('usted') || p === 'llover' || p === 'tren' || p.includes('el tren')) return 2;
    if (p.includes('nosotros')) return 3;
    if (p.includes('vosotros')) return 4;
    return 2; // Default for cases like 'llover' etc.
};

const getRegularConjugation = (verb: string, personIndex: number, mode: 'subjuntivo' | 'indicativo'): string | null => {
    const stem = verb.slice(0, -2);
    const ending = verb.slice(-2);
    let endings;

    if (mode === 'subjuntivo') {
        if (ending === 'ar') endings = ['e', 'es', 'e', 'emos', 'éis', 'en'];
        else if (ending === 'er' || ending === 'ir') endings = ['a', 'as', 'a', 'amos', 'áis', 'an'];
        else return null;
    } else if (mode === 'indicativo') {
        if (ending === 'ar') endings = ['o', 'as', 'a', 'amos', 'áis', 'an'];
        else if (ending === 'er') endings = ['o', 'es', 'e', 'emos', 'éis', 'en'];
        else if (ending === 'ir') endings = ['o', 'es', 'e', 'imos', 'ís', 'en'];
        else return null;
    } else {
        return null;
    }
    return stem + endings[personIndex];
};

const getConjugation = (verb: string, personIndex: number, mode: 'subjuntivo' | 'indicativo'): string | null => {
    const map = mode === 'subjuntivo' ? SUBJUNTIVO_MAP : INDICATIVO_MAP;
    if (map[verb]) return map[verb][personIndex];
    
    const cleanVerb = verb.replace(/se$/, '').trim();
    if (map[cleanVerb]) return map[cleanVerb][personIndex];
    
    return getRegularConjugation(cleanVerb, personIndex, mode);
};

const getAllConjugations = (verb: string, mode: 'subjuntivo' | 'indicativo'): (string | null)[] => {
    const map = mode === 'subjuntivo' ? SUBJUNTIVO_MAP : INDICATIVO_MAP;
    const cleanVerb = verb.replace(/se$/, '').trim();

    if (map[verb]) return map[verb];
    if (map[cleanVerb]) return map[cleanVerb];
    
    return Array.from({ length: 6 }, (_, i) => getRegularConjugation(cleanVerb, i, mode));
};

export const generateQuestions = (poolName: QuestionPool, count: number, type: ExerciseType): Exercise[] => {
    const pool = questionBank[poolName];
    if (!pool) return [];

    const shuffledPool = shuffleArray([...pool]);
    const selectedQuestions = shuffledPool.slice(0, count);

    return selectedQuestions.map(q => {
        let finalAnswer = q.answer;
        let finalExercise: Exercise = { ...q, answer: finalAnswer, cleanedAnswer: cleanAnswer(finalAnswer) };

        if (type === 'radio') {
            if (poolName === 'formaPura' || poolName === 'disparadores') {
                // FIX: Cast `q` to `any` to access the `verb` property. The type of `q` is a union, and `verb` doesn't exist on all members.
                // The logic guarantees that `verb` is present for these pool names.
                const matches = ((q as any).verb || '').match(/\((.*?)\)/);
                if (!matches) return { ...q, answer: finalAnswer, cleanedAnswer: cleanAnswer(finalAnswer), shuffledOptions: [] };

                const parts = matches[1].split(',').map(p => p.trim());
                const rawInfinitive = parts[parts.length - 1];
                const infinitive = rawInfinitive.replace(/se$/, '').trim();
                const pronoun = parts.length > 1 ? parts.slice(0, parts.length - 1).join(', ') : 'él';
                const personIndex = getPersonIndex(pronoun);

                const correctAnswer = getConjugation(rawInfinitive, personIndex, 'subjuntivo') || q.answer;
                finalAnswer = correctAnswer;

                let allFormsSet = new Set<string>();
                getAllConjugations(infinitive, 'indicativo').forEach(f => { if(f) allFormsSet.add(f); });
                getAllConjugations(infinitive, 'subjuntivo').forEach(f => { if(f) allFormsSet.add(f); });
                
                let distractorPool = Array.from(allFormsSet).filter(f => f && cleanAnswer(f) !== cleanAnswer(correctAnswer));
                
                const samePersonIndicative = getConjugation(rawInfinitive, personIndex, 'indicativo');
                if (samePersonIndicative && cleanAnswer(samePersonIndicative) !== cleanAnswer(correctAnswer)) {
                    distractorPool = distractorPool.filter(f => cleanAnswer(f) !== cleanAnswer(samePersonIndicative));
                    distractorPool.unshift(samePersonIndicative);
                }
                if (poolName === 'disparadores' && !distractorPool.some(f => cleanAnswer(f) === cleanAnswer(infinitive))) {
                     distractorPool.unshift(infinitive);
                }

                shuffleArray(distractorPool);
                const selectedDistractors = distractorPool.slice(0, 3);
                let finalOptions = [...new Set([correctAnswer, ...selectedDistractors])];
                
                if (finalOptions.length < 4) {
                    const allVerbs = Object.keys(SUBJUNTIVO_MAP);
                    const genericDistractors = new Set<string>();
                    const otherVerbs = allVerbs.filter(v => v !== infinitive);
                    
                    while (genericDistractors.size < 20 && otherVerbs.length > 0) {
                        const randomVerb = otherVerbs[Math.floor(Math.random() * otherVerbs.length)];
                        const randomConjugations = getAllConjugations(randomVerb, 'subjuntivo').concat(getAllConjugations(randomVerb, 'indicativo'));
                        randomConjugations.forEach(c => { if (c) genericDistractors.add(c); });
                    }
                    
                    const genericDistractorsArray = shuffleArray(Array.from(genericDistractors));
                    
                    for (const distractor of genericDistractorsArray) {
                        if (finalOptions.length >= 4) break;
                        if (!finalOptions.some(opt => cleanAnswer(opt) === cleanAnswer(distractor))) {
                            finalOptions.push(distractor);
                        }
                    }
                }
                
                finalExercise.shuffledOptions = shuffleArray(finalOptions.slice(0, 4));

            } else if (poolName === 'contraste') {
                const qContraste = q as typeof questionBank.contraste[0];
                finalExercise.shuffledOptions = shuffleArray([qContraste.answer, qContraste.other]);
                finalAnswer = qContraste.answer;
            } else if (poolName === 'identificarError') {
                 const qErrorId = q as typeof questionBank.identificarError[0];
                 finalExercise.shuffledOptions = shuffleArray([...qErrorId.options]);
                 finalAnswer = qErrorId.answer;
            }
        } else if (type === 'ordering') {
            // FIX: Cast `q` to `any` to access the `words` property. The type of `q` is a union, and `words` doesn't exist on all members.
            // The logic guarantees that `words` is present for this exercise type.
            if ((q as any).words) {
                finalExercise.shuffledWords = shuffleArray([...(q as any).words]);
            }
        }
        
        finalExercise.answer = finalAnswer;
        finalExercise.cleanedAnswer = cleanAnswer(finalAnswer);
        return finalExercise;
    });
};