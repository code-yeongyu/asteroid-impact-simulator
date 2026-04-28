import { useState } from 'react';
import type { JSX } from 'react';
import { buildCurrentShareUrl } from '../../lib/url';
import { useImpactStore } from '../../store';
import { Button } from '../ui/Button';

export function ShareButton(): JSX.Element {
  const params = useImpactStore((state) => state.params);
  const [copied, setCopied] = useState(false);

  const handleShare = async (): Promise<void> => {
    const shareUrl = buildCurrentShareUrl(params);
    if (shareUrl === null || typeof navigator === 'undefined') {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="ghost" data-testid="share-button" onClick={() => void handleShare()}>
        Share link
      </Button>
      <span aria-live="polite" className="text-[var(--fs-xs)] text-[var(--accent-cyan)]">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  );
}
