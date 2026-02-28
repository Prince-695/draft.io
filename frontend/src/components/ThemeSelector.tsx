'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomTheme, allThemes } from '@/hooks/useCustomTheme';
import { Check } from 'lucide-react';

function ColorSwatch({ primaryOklch }: { primaryOklch: string }) {
  return (
    <span
      className="inline-block w-4 h-4 rounded-full border border-black/10 dark:border-white/10 shrink-0"
      style={{ backgroundColor: primaryOklch }}
    />
  );
}

export function ThemeSelector() {
  const { themeId, setCustomTheme } = useCustomTheme();

  return (
    <Select value={themeId} onValueChange={setCustomTheme}>
      <SelectTrigger className="w-56">
        {/* Custom trigger: show current theme swatch + name */}
        <span className="flex items-center gap-2 min-w-0">
          {(() => {
            const active = allThemes.find((t) => t.id === themeId) ?? allThemes[0];
            return (
              <>
                <ColorSwatch primaryOklch={active.light['--primary']} />
                <span className="truncate">{active.name}</span>
              </>
            );
          })()}
        </span>
      </SelectTrigger>

      <SelectContent className="max-h-72 overflow-y-auto">
        {allThemes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            <span className="flex items-center gap-2">
              <ColorSwatch primaryOklch={theme.light['--primary']} />
              <span>{theme.name}</span>
              {theme.id === themeId && (
                <Check className="w-3.5 h-3.5 ml-auto text-primary shrink-0" />
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
