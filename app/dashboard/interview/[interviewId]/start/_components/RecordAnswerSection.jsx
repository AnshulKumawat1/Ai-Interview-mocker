"use client";
import { Button } from '@/components/ui/button';
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, Webcam } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment/moment';
import { db } from '@/utils/db';

function RecordAnswerSection({ mockInterviewQuestion, activeQuestionIndex, interviewData }) {
    const [userAnswer, setUserAnswer] = useState('');
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.forEach((result) => {
            setUserAnswer(prevAns => prevAns + result?.transcript);
        });
    }, [results]);

    useEffect(() => {
        if (isRecording && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [userAnswer]);

    const StartStopRecording = async () => {
        if (isRecording) {
            stopSpeechToText();
            if (userAnswer?.length < 10) {
                setLoading(false);
                toast('Error while saving your answer. Please record it again.');
                return;
            }
        } else {
            startSpeechToText();
        }
    };

    const UpdateUserAnswer = async () => {
        console.log(userAnswer);
        setLoading(true);
        const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.Question}, User Answer: ${userAnswer}, Depending on the question and user answer for the given interview question, please give us a numerical rating for the answer and text feedback in the area of improvement if any in just 3 to 5 lines in JSON format with rating and feedback fields.`;

        try {
            const result = await chatSession.sendMessage(feedbackPrompt);
            const responseText = await result.response.text(); // Ensuring the response is correctly converted to text
            console.log('API Response Text:', responseText);

            // Remove markdown formatting if present
            const jsonResponse = responseText.trim().replace(/^```json/, '').replace(/```$/, '').trim();

            // Check if the response text is in JSON format
            if (jsonResponse.startsWith('{') && jsonResponse.endsWith('}')) {
                // Assuming the response is a JSON string, we need to parse it
                let feedback;
                try {
                    feedback = JSON.parse(jsonResponse);
                    console.log('Parsed Feedback:', feedback);
                } catch (parseError) {
                    console.error('Error parsing JSON response:', parseError);
                    toast('Error parsing the feedback response. Please try again.');
                    setLoading(false);
                    return;
                }

                if (feedback?.rating && feedback?.feedback) {
                    const resp = await db.insert(UserAnswer)
                        .values({
                            mockIdRef: interviewData?.mockId,
                            question: mockInterviewQuestion[activeQuestionIndex]?.Question,
                            correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                            userAns: userAnswer,
                            feedback: feedback?.feedback,
                            rating: feedback?.rating,
                            userEmail: user?.primaryEmailAddress?.emailAddress,
                            createdAt: moment().format('DD-MM-yyyy')
                        });

                    if (resp) {
                        toast('User answer recorded successfully');
                        setResults([])
                    }
                    setResults([])
                    setUserAnswer('');
                    setLoading(false);
                } else {
                    console.error('Invalid feedback format:', feedback);
                    toast('Invalid feedback format received. Please try again.');
                    setLoading(false);
                }
            } else {
                console.error('Response is not in JSON format:', responseText);
                toast('Unexpected response format. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error while fetching feedback:', error);
            toast('An error occurred while fetching feedback.');
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex mt-20 flex-col justify-center items-center bg-black bg-secondary rounded-lg p-5'>
                <Image src={'/webcam.png'} width={200} height={200} className='absolute' />
                <Webcam
                    mirrored={true}
                    style={{
                        height: 400, width: '50%', zIndex: 10,
                    }}
                />
            </div>

            <Button variant="outline" className="my-10" onClick={StartStopRecording}>
                {isRecording ?
                    <h2 className='text-red-800 flex gap-2'>
                        <Mic /> 'Recording...'
                    </h2>
                    :
                    'Record Answer'}
            </Button>

            {/* <Button onClick={() => console.log(userAnswer)}>Show user answer</Button> */}
        </div>
    );
}

export default RecordAnswerSection;
