"use client";
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle } from 'lucide-react';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState("");
    const [jobDesc, setJobDesc] = useState("");
    const [jobExperience, setJobExperience] = useState("");
    const [loading, setLoading] = useState(false);
    const [JsonResponse, setJsonResponse] = useState([]);
    const router=useRouter();
    const { user } = useUser();

    const onSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        console.log(jobPosition, jobDesc, jobExperience);

        const InputPrompt = `Job Position: ${jobPosition}, Job Description: ${jobDesc}, Years of Experience: ${jobExperience}, Based on this information please give me ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT} interview questions with answers in JSON format. Give Question and Answer as fields in JSON.`;

        try {
            const result = await chatSession.sendMessage(InputPrompt);
            const responseText = await result.response.text();
            const mockJsonResponse = responseText.replace('```json', '').replace('```', '');

            const parsedJsonResponse = JSON.parse(mockJsonResponse);
            console.log(parsedJsonResponse);

            setJsonResponse(parsedJsonResponse);

            if (parsedJsonResponse) {
                const resp = await db.insert(MockInterview).values({
                    mockId: uuidv4(),
                    jsonMockResp: mockJsonResponse,
                    jobPosition: jobPosition,
                    jobDesc: jobDesc,
                    jobExperience: jobExperience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format("DD-MM-YYYY")
                }).returning({ mockId: MockInterview.mockId });

                console.log("inserted id", resp);
                if(resp){
                  setOpenDialog(false);
                  router.push('/dashboard/interview/'+resp[0]?.mockId)
                }
            } else {
                console.log("error");
            }
        } catch (error) {
            console.error("Failed to generate mock interview:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div
                className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all'
                onClick={() => setOpenDialog(true)}
            >
                <h2 className='text-lg text-center'>+Add New</h2>
            </div>
            <Dialog open={openDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Tell us more about your interviewing</DialogTitle>
                        <DialogDescription>
                            <form onSubmit={onSubmit}>
                                <div>
                                    <h2>Add details about your job position/role, job description, and years of experience</h2>
                                    <div className='mt-7 my-3'>
                                        <label>Job role/Job position</label>
                                        <Input
                                            placeholder="Ex. Full stack developer"
                                            required
                                            onChange={(event) => setJobPosition(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Job Description</label>
                                        <Textarea
                                            placeholder="Ex. React, Node.js, MySQL"
                                            required
                                            onChange={(event) => setJobDesc(event.target.value)}
                                        />
                                    </div>
                                    <div className='my-3'>
                                        <label>Years of experience</label>
                                        <Input
                                            placeholder="5"
                                            type="number"
                                            required
                                            onChange={(event) => setJobExperience(event.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-5 justify-end'>
                                    <Button variant="ghost" onClick={() => setOpenDialog(false)}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <LoaderCircle className='animate-spin' /> Generating from AI
                                            </>
                                        ) : 'Start Interview'}
                                    </Button>
                                </div>
                            </form>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default AddNewInterview;
