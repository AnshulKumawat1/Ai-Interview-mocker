
"use client"
import { Button } from '@/components/ui/button'
import { db } from '@/utils/db'
import { MockInterview } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { Lightbulb, Link as LucideLink, WebcamIcon } from 'lucide-react'
import Link from 'next/link' // Ensure Link is imported from next/link

import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState(null);  // Initialize as null
  const [webCamEnabled, setWebCamEnabled] = useState(false);

  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    const result = await db.select().from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    console.log(result);
    setInterviewData(result[0]);
  }

  return (
    <div className='my-10'>
      <h2 className='font-bold text-2xl'> Let's get started</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div className='flex flex-col my-5 gap-5 '>
          <div className='flex flex-col my-5 gap-5'>
            <div className='flex flex-col p-5 rounded-lg border gap-5'>
            {interviewData ? (
              <>
                <h2 className='text-lg'> <strong>Job Role:</strong> {interviewData.jobPosition}</h2>
                <h2 className='text-lg'> <strong>Job Description:</strong> {interviewData.jobDesc}</h2>
                <h2 className='text-lg'> <strong>Years of experience:</strong> {interviewData.jobExperience}</h2>
              </>
            ) : (
              <p>Loading...</p>
            )}
            </div>
            <div className='p-5 border rounded-lg border-blue-700 bg-yellow-200' >

            <h2 className='flex gap-2 items-center'><Lightbulb/> <strong> Information</strong></h2>
            <h2 >{process.env.NEXT_PUBLIC_INFORMATION}</h2>

            </div>
          </div>
        </div>
        <div>
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              style={{
                height: 300,
                width: 300
              }}
            />
          ) : (
            <>
              <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
              <Button className="w-full" onClick={() => { setWebCamEnabled(true) }}>Enable Webcam and microphone</Button>
            </>
          )}
        </div>
      </div>
      <div className='flex justify-end items-end mt-5'>
        <Link href={`/dashboard/interview/${params.interviewId}/start`}>
          <Button>Start Interview</Button>
        </Link>
      </div>
    </div>
  )
}

export default Interview
