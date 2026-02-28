'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores';
import { API_ENDPOINTS, ROUTES } from '@/utils/constants';
import apiClient from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

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

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<QuestionnaireData>({
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

  const seedRecommendations = (interests: string[]) => {
    // Fire-and-forget: sync interests into the recommendation engine
    apiClient
      .post(API_ENDPOINTS.RECOMMENDATIONS.SEED_INTERESTS, { interests })
      .catch(() => { /* non-critical — feed will still work via reading history */ });
  };

  const onSubmit = async (data: QuestionnaireData) => {
    try {
      // Combine interests and preferred_topics for the backend
      const allInterests = [...new Set([...data.interests, ...data.preferred_topics])];
      await apiClient.post(API_ENDPOINTS.USER.PERSONALIZE, {
        interests: allInterests,
        experience_level: data.writing_experience === 'professional' ? 'advanced' : data.writing_experience,
        writing_goals: [`Reads ${data.reading_frequency}`, `Prefers ${data.blog_length} posts`],
      });
      // Also update local store
      updateUser({ interests: allInterests });
      // Seed recommendation engine with explicit interests
      seedRecommendations(allInterests);
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
      // Navigate anyway so users aren't stuck
      router.push(ROUTES.DASHBOARD);
    }
  };

  // Bypass zod validation on final step so users are never stuck
  const handleComplete = async () => {
    const values = getValues();
    try {
      const allInterests = [...new Set([...selectedInterests, ...selectedTopics])];
      if (allInterests.length > 0 || values.writing_experience) {
        await apiClient.post(API_ENDPOINTS.USER.PERSONALIZE, {
          interests: allInterests,
          experience_level: values.writing_experience === 'professional' ? 'advanced' : values.writing_experience,
          writing_goals: [`Reads ${values.reading_frequency}`, `Prefers ${values.blog_length} posts`],
        });
        updateUser({ interests: allInterests });
        // Seed recommendation engine with explicit interests
        seedRecommendations(allInterests);
      }
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
    }
    router.push(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Personalize Your Experience</h1>
          <p className="text-muted-foreground">Help us understand your interests to provide better recommendations</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
          </div>
          <Progress value={(step / 4) * 100} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="pt-6">
              {step === 1 && (
                <div className="space-y-4">
                  <CardTitle className="text-2xl">What are you interested in?</CardTitle>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTERESTS.map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                        onClick={() => toggleInterest(interest)}
                        className="h-auto py-3"
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                  {errors.interests && (
                    <p className="text-sm text-destructive">{errors.interests.message}</p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <CardTitle className="text-2xl">Specific topics you'd like to read about?</CardTitle>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TOPICS.map((topic) => (
                      <Button
                        key={topic}
                        type="button"
                        variant={selectedTopics.includes(topic) ? "default" : "outline"}
                        onClick={() => toggleTopic(topic)}
                        className="h-auto py-3"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                  {errors.preferred_topics && (
                    <p className="text-sm text-destructive">{errors.preferred_topics.message}</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <CardTitle className="text-2xl">Your writing experience?</CardTitle>
                  <RadioGroup {...register('writing_experience')} defaultValue="beginner">
                    <div className="space-y-3">
                      {[
                        { value: 'beginner', label: 'Beginner', desc: 'Just starting out' },
                        { value: 'intermediate', label: 'Intermediate', desc: 'Some writing experience' },
                        { value: 'advanced', label: 'Advanced', desc: 'Regular blogger' },
                        { value: 'professional', label: 'Professional', desc: 'Published writer' },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          htmlFor={option.value}
                          className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-accent has-checked:border-primary"
                        >
                          <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                          <div className="ml-3">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <CardTitle className="text-2xl mb-4">How often do you read blogs?</CardTitle>
                    <RadioGroup {...register('reading_frequency')} defaultValue="weekly">
                      <div className="space-y-3">
                        {[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'occasionally', label: 'Occasionally' },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            htmlFor={`reading-${option.value}`}
                            className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-accent has-checked:border-primary"
                          >
                            <RadioGroupItem value={option.value} id={`reading-${option.value}`} />
                            <span className="ml-3 font-medium">{option.label}</span>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <CardTitle className="text-xl mb-4">Preferred blog length?</CardTitle>
                    <RadioGroup {...register('blog_length')} defaultValue="medium">
                      <div className="space-y-3">
                        {[
                          { value: 'short', label: 'Short', desc: '< 5 min read' },
                          { value: 'medium', label: 'Medium', desc: '5-10 min read' },
                          { value: 'long', label: 'Long', desc: '> 10 min read' },
                          { value: 'any', label: 'Any length' },
                        ].map((option) => (
                          <Label
                            key={option.value}
                            htmlFor={`length-${option.value}`}
                            className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-accent has-checked:border-primary"
                          >
                            <RadioGroupItem value={option.value} id={`length-${option.value}`} className="mt-1" />
                            <div className="ml-3">
                              <div className="font-medium">{option.label}</div>
                              {option.desc && <div className="text-sm text-muted-foreground">{option.desc}</div>}
                            </div>
                          </Label>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    Back
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    className="ml-auto"
                  >
                    Complete Setup
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
