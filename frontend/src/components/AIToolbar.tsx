'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  FileEdit, 
  CheckCircle, 
  Target, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAIUsage } from '@/hooks/useAI';
import { useUIStore } from '@/stores/uiStore';

interface AIToolbarProps {
  onGenerate: (prompt: string, type: 'generate' | 'improve' | 'grammar' | 'seo') => void;
  isLoading?: boolean;
}

export function AIToolbar({ onGenerate, isLoading = false }: AIToolbarProps) {
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [prompt, setPrompt] = useState('');
  // Instruction for Improve / Grammar / quick-action dropdown items
  const [instruction, setInstruction] = useState('');

  // AI quota — fetched on mount, auto-updated by axios interceptor after each call
  useAIUsage();
  const aiUsed = useUIStore((s) => s.aiRequestsUsed);
  const aiLimit = useUIStore((s) => s.aiRequestsLimit);
  const aiRemaining = aiLimit - aiUsed;
  const usagePct = Math.min((aiUsed / aiLimit) * 100, 100);
  const usageColor = aiUsed >= aiLimit ? 'bg-red-500' : aiUsed >= aiLimit * 0.7 ? 'bg-yellow-500' : 'bg-green-500';

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, 'generate');
      setPrompt('');
      setShowPromptDialog(false);
    }
  };

  const handleQuickAction = (preset: string, type: 'improve' | 'grammar') => {
    // preset from dropdown items; falls back to the free-text instruction box
    onGenerate(preset || instruction, type);
    setInstruction('');
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground mr-1">AI Tools:</span>

        {/* Optional custom instruction — used by Improve & Grammar buttons */}
        <Input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && instruction.trim()) {
              handleQuickAction(instruction, 'improve');
            }
          }}
          placeholder="Optional instruction… e.g. add emojis"
          className="h-8 w-52 text-sm"
          disabled={isLoading}
        />

        {/* Generate Content Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPromptDialog(true)}
          disabled={isLoading || aiRemaining <= 0}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate
        </Button>

        {/* Improve Writing Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAction('', 'improve')}
          disabled={isLoading || aiRemaining <= 0}
          className="gap-2"
        >
          <FileEdit className="w-4 h-4" />
          Improve
        </Button>

        {/* Grammar Check Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAction('', 'grammar')}
          disabled={isLoading || aiRemaining <= 0}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Grammar
        </Button>

        {/* SEO Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerate('', 'seo')}
          disabled={isLoading || aiRemaining <= 0}
          className="gap-2"
        >
          <Target className="w-4 h-4" />
          SEO
        </Button>

        {/* More Options Dropdown — each item passes a preset instruction */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading || aiRemaining <= 0}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleQuickAction('Make it more professional', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it more professional
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('Make it shorter', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it shorter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('Make it longer with more detail', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it longer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleQuickAction('Add emojis throughout the content where appropriate', 'improve')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Add emojis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickAction('Make the tone more conversational and friendly', 'improve')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Make tone conversational
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI usage indicator — always visible on the right side of the toolbar */}
        <div className="ml-auto flex items-center gap-2 min-w-[140px]">
          <div className="flex flex-col gap-0.5 w-full">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-medium ${
                aiRemaining === 0 ? 'text-red-500' : aiUsed >= aiLimit * 0.7 ? 'text-yellow-500' : 'text-muted-foreground'
              }`}>
                {aiRemaining === 0 ? 'No AI requests left' : `${aiRemaining} / ${aiLimit} AI requests left`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usageColor}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">Resets on the 1st of each month</span>
          </div>
        </div>
      </div>

      {/* Generate Content Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Content with AI
            </DialogTitle>
            <DialogDescription>
              Describe what you want to write about, and AI will generate content for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write an introduction about the benefits of meditation..."
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPromptDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
