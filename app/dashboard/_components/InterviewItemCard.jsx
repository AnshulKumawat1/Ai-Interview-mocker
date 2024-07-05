import React from 'react'

function InterviewItemCard({interview}) {
  return (
    <div className='border shadow-sm rounded-lg p-3'>
       <h2 className='font bold text-blue-700'>{interview?.jobPosition}</h2>
       <h2 className='text-sm'>{interview ?.jobExperience} years of experience</h2>
    </div>
  )
}

export default InterviewItemCard
