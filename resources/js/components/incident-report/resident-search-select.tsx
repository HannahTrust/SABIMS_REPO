import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Option = { id: number; name: string };

type ResidentSearchSelectProps = {
    id?: string;
    label: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
};

export function ResidentSearchSelect({
    id,
    label,
    options,
    value,
    onChange,
    error,
    required,
    searchPlaceholder = 'Search by name...',
    emptyMessage = 'No residents match your search.',
}: ResidentSearchSelectProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === '') {
            return options;
        }
        return options.filter((o) => o.name.toLowerCase().includes(q));
    }, [options, query]);

    const selected = options.find((o) => String(o.id) === value);

    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>
                {label}
                {required ? ' *' : ''}
            </Label>
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={id}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                />
            </div>
            {selected && (
                <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-medium text-foreground">{selected.name}</span>
                </p>
            )}
            <div
                className="max-h-44 overflow-y-auto rounded-md border border-input bg-background"
                role="listbox"
                aria-label={label}
            >
                {filtered.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-muted-foreground">{options.length === 0 ? 'No residents available.' : emptyMessage}</p>
                ) : (
                    filtered.map((opt) => {
                        const isActive = String(opt.id) === value;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                className={cn(
                                    'flex w-full border-b border-border/50 px-3 py-2.5 text-left text-sm last:border-b-0',
                                    'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                    isActive && 'bg-primary/10 text-primary',
                                )}
                                onClick={() => onChange(String(opt.id))}
                            >
                                {opt.name}
                            </button>
                        );
                    })
                )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
