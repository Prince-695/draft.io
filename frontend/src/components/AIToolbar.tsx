'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

interface AIToolbarProps {
  onGenerate: (prompt: string, type: 'generate' | 'improve' | 'grammar' | 'seo') => void;
  isLoading?: boolean;
}

export function AIToolbar({ onGenerate, isLoading = false }: AIToolbarProps) {
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt, 'generate');
      setPrompt('');
      setShowPromptDialog(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground mr-2">AI Tools:</span>
        
        {/* Generate Content Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPromptDialog(true)}
          disabled={isLoading}
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
          onClick={() => onGenerate('', 'improve')}
          disabled={isLoading}
          className="gap-2"
        >
          <FileEdit className="w-4 h-4" />
          Improve
        </Button>

        {/* Grammar Check Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onGenerate('', 'grammar')}
          disabled={isLoading}
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
          disabled={isLoading}
          className="gap-2"
        >
          <Target className="w-4 h-4" />
          SEO
        </Button>

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => onGenerate('', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it more professional
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerate('', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it shorter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerate('', 'improve')}>
              <FileEdit className="w-4 h-4 mr-2" />
              Make it longer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onGenerate('', 'improve')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Add emojis
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerate('', 'improve')}>
              <Sparkles className="w-4 h-4 mr-2" />
              Change tone
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
