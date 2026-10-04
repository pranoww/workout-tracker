"use client";

import { use } from 'react';
import { WorkoutExecution } from '@/modules/workouts/components/WorkoutExecution';

export default function WorkoutPage({ params }) {
  // In Next.js App router, params is a promise in recent versions.
  // We can unwrap it using React.use()
  const unwrappedParams = use(params);
  
  return <WorkoutExecution workoutId={unwrappedParams.id} />;
}
