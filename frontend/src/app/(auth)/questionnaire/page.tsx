'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/utils/constants';

const questionnaireSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  writing_experience: z.enum(['beginner', 'intermediate', 'advanced', 'professional']),
  preferred_topics: z.array(z.string()).min(1, 'Select at least one topic'),
  reading_frequency: z.enum(['daily', 'weekly', 'monthly', 'occasionally']),
  blog_length: z.enum(['short', 'medium', 'long', 'any']),
});

type QuestionnaireData = z.infer<typeof questionnaireSchema>;

const INTERESTS = [
  'Technology', 'Programming', 'AI/ML', 'Web Development', 'Mobile Dev',
  'Business', 'Entrepreneurship', 'Marketing', 'Finance', 'Career',
  'Lifestyle', 'Health', 'Fitness', 'Travel', 'Food',
  'Art', 'Design', 'Photography', 'Writing', 'Music',
  'Science', 'Education', 'Personal Growth', 'Productivity', 'Gaming'
];

const TOPICS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'DevOps',
  'Cloud Computing', 'Cybersecurity', 'Blockchain', 'Data Science', 'UX/UI',
  'Startup', 'Leadership', 'Sales', 'SEO', 'Content Marketing',
  'Mental Health', 'Nutrition', 'Yoga', 'Meditation', 'Cooking'
];

export default function QuestionnairePage() {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [step, setStep] = useState(1);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuestionnaireData>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      interests: [],
      preferred_topics: [],
      writing_experience: 'beginner',
      reading_frequency: 'weekly',
      blog_length: 'medium',
    },
  });

  const selectedInterests = watch('interests') || [];
  const selectedTopics = watch('preferred_topics') || [];

  const toggleInterest = (interest: string) => {
    const current = selectedInterests;
    if (current.includes(interest)) {
      setValue('interests', current.filter(i => i !== interest));
    } else {
      setValue('interests', [...current, interest]);
    }
  };

  const toggleTopic = (topic: string) => {
    const current = selectedTopics;
    if (current.includes(topic)) {
      setValue('preferred_topics', current.filter(t => t !== topic));
    } else {
      setValue('preferred_topics', [...current, topic]);
    }
  };

  const onSubmit = async (data: QuestionnaireData) => {
    try {
      // TODO: Call API to save preferences
      updateUser({
        interests: data.interests,
        expertise_tags: data.preferred_topics,
      });
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Experience</h1>
          <p className="text-gray-600">Help us understand your interests to provide better recommendations</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">What are you interested in?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedInterests.includes(interest)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {errors.interests && (
                <p className="text-red-500 text-sm">{errors.interests.message}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Specific topics you'd like to read about?</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTopics.includes(topic)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {errors.preferred_topics && (
                <p className="text-red-500 text-sm">{errors.preferred_topics.message}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your writing experience?</h2>
                <div className="space-y-3">
                  {[
                    { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
                    { value: 'intermediate', label: 'Intermediate', desc: 'Some writing experience' },
                    { value: 'advanced', label: 'Advanced', desc: 'Regular blogger' },
                    { value: 'professional', label: 'Professional', desc: 'Published writer' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register('writing_experience')}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">How often do you read blogs?</h2>
                <div className="space-y-3">
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'occasionally', label: 'Occasionally' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register('reading_frequency')}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Preferred blog length?</h2>
                <div className="space-y-3">
                  {[
                    { value: 'short', label: 'Short', desc: '< 5 min read' },
                    { value: 'medium', label: 'Medium', desc: '5-10 min read' },
                    { value: 'long', label: 'Long', desc: '> 10 min read' },
                    { value: 'any', label: 'Any length' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register('blog_length')}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        {option.desc && <div className="text-sm text-gray-500">{option.desc}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Complete Setup
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
