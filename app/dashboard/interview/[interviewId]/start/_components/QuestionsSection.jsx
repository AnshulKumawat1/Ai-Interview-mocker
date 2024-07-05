import { Lightbulb, Volume2 } from 'lucide-react';
import React, { useState } from 'react';

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
    const [speaking, setSpeaking] = useState(false);
    let speechInstance = null;

    const TextToSpeach = (text) => {
        if (!speaking && 'speechSynthesis' in window) {
            speechInstance = new SpeechSynthesisUtterance(text);
            setSpeaking(true);
            speechInstance.onend = () => {
                setSpeaking(false);
            };
            window.speechSynthesis.speak(speechInstance);
        } else {
            alert('Sorry, your browser does not support text to speech or speech is currently active.');
        }
    };

    return mockInterviewQuestion && (
        <div className='p-5 border rounded-lg my-10'>
            <div className='grid grid-col-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {mockInterviewQuestion.map((question, index) => (
                    <h2
                        className={`p-2 bg-secondary rounded-full text-xs md:text-sm text-center cursor-pointer ${activeQuestionIndex === index && 'bg-primary text-blue-700'}`}
                        key={index}
                    >
                        Question #{index + 1}
                    </h2>
                ))}
            </div>
            <div>
                <h2 className='my-5 text-md md:text-lg'>
                    {mockInterviewQuestion[activeQuestionIndex]?.Question}
                </h2>
                <Volume2 onClick={() => TextToSpeach(mockInterviewQuestion[activeQuestionIndex]?.Question)} />
            </div>
            <div className='border rounded-lg p-5 bg-blue-100 mt-20'>
                <h2 className='flex gap-2 items-center text-blue-900'>
                    <Lightbulb />
                    <strong>Notes:</strong>
                </h2>
                <h2>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</h2>
            </div>
        </div>
    );
}

export default QuestionsSection;
