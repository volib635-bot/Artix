import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Sparkles, Eye, EyeOff, Loader2, Check, AlertCircle, ChevronDown, Trash2 } from 'lucide-react';
import { useAISettings } from '@/hooks/useAISettings';
import { PROVIDER_LIST, PROVIDERS } from '@/lib/ai/registry';
import { ProviderId, AIError } from '@/lib/ai/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SlotKey = 'primary' | 'backup';
type TestStatus = 'idle' | 'loading' | 'success' | 'error';

function ProviderSlot({
  slot,
  label,
}: {
  slot: SlotKey;
  label: string;
}) {
  const { settings, update } = useAISettings();
  const current = settings[slot];
  const [provider, setProvider] = useState<ProviderId>(current?.provider ?? 'openai');
  const [model, setModel] = useState<string>(
    current?.model ?? PROVIDERS[current?.provider ?? 'openai'].defaultModel
  );
  const [apiKey, setApiKey] = useState<string>(current?.apiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testMessage, setTestMessage] = useState('');

  const providerDef = PROVIDERS[provider];

  const handleProviderChange = (p: ProviderId) => {
    setProvider(p);
    setModel(PROVIDERS[p].defaultModel);
    setTestStatus('idle');
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Enter an API key');
      return;
    }
    update({
      ...settings,
      [slot]: { provider, model, apiKey: apiKey.trim() },
    });
    toast.success(`${label} provider saved`);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Enter an API key first');
      return;
    }
    setTestStatus('loading');
    setTestMessage('');
    try {
      await providerDef.testConnection({ apiKey: apiKey.trim(), model });
      setTestStatus('success');
      setTestMessage('Connection OK');
    } catch (err) {
      const e = err as AIError;
      setTestStatus('error');
      setTestMessage(e.message || 'Connection failed');
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="text-sm font-medium">{label}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={(v) => handleProviderChange(v as ProviderId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDER_LIST.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providerDef.models.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>API key</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Paste your ${providerDef.label} key`}
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleSave} size="sm">
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testStatus === 'loading'}
          className="gap-2"
        >
          {testStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
          Test connection
        </Button>
        {testStatus !== 'idle' && testStatus !== 'loading' && (
          <span
            className={cn(
              'text-xs flex items-center gap-1',
              testStatus === 'success' ? 'text-success' : 'text-destructive'
            )}
          >
            {testStatus === 'success' ? (
              <Check className="h-3 w-3" />
            ) : (
              <AlertCircle className="h-3 w-3" />
            )}
            {testMessage}
          </span>
        )}
      </div>
    </div>
  );
}

export function AISettingsCard() {
  const { settings, clear } = useAISettings();
  const [backupOpen, setBackupOpen] = useState(!!settings.backup);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Configuration
        </CardTitle>
        <CardDescription>
          Bring your own key — keys are stored only in your browser and sent directly to the provider.
          Fenix never sees them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProviderSlot slot="primary" label="Primary provider" />

        <Collapsible open={backupOpen} onOpenChange={setBackupOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', backupOpen && 'rotate-180')}
              />
              Backup provider (optional)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <ProviderSlot slot="backup" label="Backup provider" />
          </CollapsibleContent>
        </Collapsible>

        <div className="pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-destructive">
                <Trash2 className="h-4 w-4" />
                Clear all AI keys
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove all AI keys?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes your AI provider keys from this browser. You can paste them again any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clear();
                    toast.success('AI keys cleared');
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
