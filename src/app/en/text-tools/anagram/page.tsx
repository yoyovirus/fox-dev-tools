/*
  Website: FoX Dev Tools - Tools for Developers
  Author: Rahul Khedekar
  Copyright © 2026 FoX Dev Tools. All rights reserved.

  This code is proprietary and may not be copied, modified,
  or distributed without permission.
*/
"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Trash2, Shuffle, FileText } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Editor } from "@/components/Editor";
import { ToolHeader } from "@/components/ToolHeader";
import { getToolColor } from "@/lib/toolColors";
import { CopyButton } from "@/components/CopyButton";
import { AnimatedButton } from "@/components/AnimatedButton";

const COMMON_WORDS = new Set([
    // Basic common words
    "a", "i", "the", "be", "to", "of", "and", "in", "that", "have", "it",
    "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
    "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
    "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know",
    "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come",
    "its", "over", "think", "also", "back", "after", "use", "two", "how",
    "our", "work", "first", "well", "way", "even", "new", "want", "because",
    "any", "these", "give", "day", "most", "is", "was", "are", "been", "has",
    "had", "were", "said", "did", "does", "set", "under", "may", "such",
    "own", "should", "world", "write", "find", "long", "down", "still",
    "each", "mean", "keep", "same", "another", "begin", "great", "where",
    "those", "both", "here", "might", "while", "state", "small", "every",
    "between", "high", "really", "something", "must", "city", "before",
    // Common anagram pairs/groups - valid English words only
    "silent", "listen", "enlist", "inlets", "tinsel",
    "rat", "tar", "art",
    "eat", "tea", "ate",
    "post", "pots", "stop", "tops", "spot", "opts",
    "live", "evil", "vile", "veil",
    "note", "tone",
    "net", "ten",
    "read", "dear", "dare", "lead",
    "sale", "seal", "ales",
    "east", "eats", "teas", "seat",
    "late", "tale", "teal",
    "male", "meal",
    "name", "mean",
    "main", "amine",
    "marble", "ramble",
    "night", "thing", "light", "tight", "fight", "right", "sight", "might",
    "angel", "angle", "glean",
    "bored", "robed",
    "bread", "beard",
    "cinema", "iceman",
    "crate", "trace", "cater",
    "danger", "garden", "ranged",
    "dealer", "leader", "redeal",
    "debit", "bidet",
    "dog", "god",
    "draw", "ward",
    "dusty", "study",
    "earth", "heart", "hater",
    "elbow", "below",
    "face", "cafe",
    "file", "life",
    "flea", "leaf",
    "flow", "wolf",
    "form", "from",
    "frame", "farm",
    "frog", "grog",
    "keep", "peek",
    "lace", "cale",
    "lame", "male", "meal",
    "last", "salt", "slat",
    "least", "steal", "stale", "tesla",
    "liar", "rail",
    "lived", "devil",
    "loot", "tool",
    "march", "charm",
    "mate", "team", "tame", "meat",
    "moon", "noon",
    "more", "rome",
    "mother", "thermo",
    "nail", "lain",
    "nap", "pan",
    "near", "earn",
    "neat", "ante",
    "nest", "sent",
    "nine", "nein",
    "nip", "pin",
    "nit", "tin",
    "no", "on",
    "nose", "ones",
    "not", "ton",
    "now", "won",
    "oat", "tao",
    "oboe", "boeo",
    "odd", "ddo",
    "off", "ffo",
    "often", "nefto",
    "oh", "ho",
    "oil", "lio",
    "old", "dol",
    "one", "neo",
    "only", "lony",
    "open", "nope",
    "opt", "top", "pot",
    "or", "ro",
    "oral", "roal",
    "our", "uro",
    "out", "uto",
    "over", "rove",
    "owl", "lwo",
    "own", "now",
    "pace", "cape",
    "pack", "kcap",
    "pact", "capt",
    "page", "gape",
    "paid", "dipa",
    "pail", "liap",
    "pain", "napi",
    "pair", "riap",
    "pale", "leap", "plea",
    "palm", "lamp",
    "pans", "snap",
    "pant", "tnap",
    "papa", "appa",
    "par", "rap",
    "part", "trap", "rapt", "prat",
    "pass", "ssap",
    "past", "spat", "taps",
    "pat", "tap",
    "pate", "tape",
    "paw", "wap",
    "pay", "yap",
    "pea", "ape",
    "peak", "kape",
    "pear", "rape", "reap",
    "peas", "sepa",
    "peat", "tape",
    "pedal", "lepad",
    "peel", "leep",
    "peer", "reep",
    "peg", "gep",
    "pen", "nep",
    "pep", "pep",
    "per", "rep",
    "pet", "tep",
    "pew", "wep",
    "pie", "epi",
    "pig", "gip",
    "pin", "nip",
    "pit", "tip",
    "ply", "lyp",
    "pod", "dop",
    "poem", "mope",
    "poet", "tope",
    "pole", "lope",
    "polo", "loop",
    "pond", "dnop",
    "pony", "ynop",
    "pool", "loop",
    "poor", "roop",
    "pop", "pop",
    "pore", "rope",
    "pork", "krop",
    "port", "trop",
    "pose", "sop",
    "pour", "ruop",
    "pout", "tuop",
    "pram", "ramp",
    "press", "sserp",
    "prey", "yper",
    "prim", "rimp",
    "pro", "orp",
    "pub", "bup",
    "pull", "llup",
    "pump", "pmup",
    "pun", "nup",
    "pup", "pup",
    "pure", "rupe",
    "push", "hsup",
    "put", "tup",
    "quid", "duiq",
    "quit", "tuiq",
    "quote", "eutoq",
    "rab", "bar",
]);

export default function AnagramPage() {
    const [input, setInput] = useState<string>("");
    const [anagrams, setAnagrams] = useState<string[]>([]);
    const [permutations, setPermutations] = useState<string[]>([]);

    useEffect(() => {
        document.title = "Anagram - FoX Dev Tools";
        return () => { document.title = "FoX Dev Tools"; };
    }, []);

    const findAnagrams = () => {
        const word = input.toLowerCase().trim().replace(/[^a-z]/g, '');
        if (!word) {
            setAnagrams([]);
            return;
        }

        const sorted = word.split('').sort().join('');
        const results: string[] = [];

        COMMON_WORDS.forEach(commonWord => {
            if (commonWord === word) return;
            const sortedCommon = commonWord.split('').sort().join('');
            if (sortedCommon === sorted) {
                results.push(commonWord);
            }
        });

        setAnagrams(results);
    };

    const generatePermutations = () => {
        const word = input.toLowerCase().trim().replace(/[^a-z]/g, '');
        if (!word || word.length > 7) {
            setPermutations([]);
            return;
        }

        const results: string[] = [];
        const used = new Array(word.length).fill(false);
        const current: string[] = [];

        const backtrack = () => {
            if (current.length === word.length) {
                const permutation = current.join('');
                if (permutation !== word) {
                    results.push(permutation);
                }
                return;
            }

            for (let i = 0; i < word.length; i++) {
                if (used[i]) continue;
                if (i > 0 && word[i] === word[i - 1] && !used[i - 1]) continue;

                used[i] = true;
                current.push(word[i]);
                backtrack();
                current.pop();
                used[i] = false;
            }
        };

        backtrack();

        setPermutations([...new Set(results)]);
    };

    useEffect(() => {
        findAnagrams();
        generatePermutations();
    }, [input]);

    const shuffleLetters = () => {
        const letters = input.split('').filter(c => c.trim());
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        setInput(letters.join(''));
    };

    const sortedLetters = useMemo(() => {
        if (!input) return "";
        return input.split('').filter(c => c.trim()).sort().join(' ');
    }, [input]);

    const letterCount = useMemo(() => {
        const counts: Record<string, number> = {};
        input.toLowerCase().split('').forEach(char => {
            if (char.trim()) {
                counts[char] = (counts[char] || 0) + 1;
            }
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [input]);

    const clearInput = () => {
        setInput("");
        setAnagrams([]);
        setPermutations([]);
    };

    const loadSample = () => {
        setInput("listen");
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
            <ToolHeader
                toolName="Anagram"
                toolColor={getToolColor("Anagram")}
                description="Find anagrams and rearrange letters to form new words."
            />



            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                <div className="flex-1 min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Input Word/Phrase
                            {input && (
                                <div className="ml-3 flex gap-2">
                                    <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`L: ${input.replace(/[^a-zA-Z]/g, '').length}`}</Badge>
                                    <Badge variant="outline" className="font-mono bg-background text-muted-foreground h-5 px-1.5 text-[10px] rounded-sm">{`Sorted: ${sortedLetters}`}</Badge>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={Shuffle} label="Shuffle" onClickAction={shuffleLetters} />
                            <AnimatedButton variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5" icon={FileText} label="Sample" onClickAction={loadSample} />
                            {input && (
                                <>
                                    <Separator orientation="vertical" className="h-4 mx-1" />
                                    <CopyButton textToCopy={input} tooltipText="Copy" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download" onClickAction={() => { const blob = new Blob([input], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "input.txt"; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearInput} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1">
                        <Editor value={input} placeholder="Enter a word or phrase to find anagrams..." onChange={(val) => setInput(val || "")} />
                    </div>
                </div>

                <div className="flex-[0.5] min-w-[300px] min-h-[250px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Letter Frequency
                        </div>
                        <div className="flex items-center gap-1">
                            {letterCount.length > 0 && (
                                <>
                                    <CopyButton textToCopy={letterCount.map(([l, c]) => `${l.toUpperCase()}: ${c}`).join('\n')} tooltipText="Copy Frequencies" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Frequencies" onClickAction={() => {
                                                const text = letterCount.map(([l, c]) => `${l.toUpperCase()}: ${c}`).join('\n');
                                                const blob = new Blob([text], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "frequencies.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearInput} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 pt-0">
                        <div className="flex flex-col gap-2">
                            {letterCount.length > 0 ? (
                                letterCount.map(([letter, count]) => {
                                    const percentage = Math.round((count / input.replace(/[^a-zA-Z]/g, '').length) * 100);
                                    return (
                                        <div key={letter} className="flex items-center gap-3">
                                            <Badge variant="outline" className="w-8 justify-center font-mono bg-muted/50 text-muted-foreground whitespace-nowrap">{letter.toUpperCase()}</Badge>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary/50 rounded-full" style={{ width: `${percentage}%` }} />
                                            </div>
                                            <div className="text-xs font-medium text-muted-foreground w-12 text-right">{count} ({percentage}%)</div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center justify-center h-full min-h-[100px]">Enter text to see letter frequency</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-[0.8] min-h-0">
                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            Dictionary Anagrams
                            <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm">
                                {anagrams.length}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                            {anagrams.length > 0 && (
                                <>
                                    <CopyButton textToCopy={anagrams.join('\n')} tooltipText="Copy Anagrams" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Anagrams" onClickAction={() => {
                                                const text = anagrams.join('\n');
                                                const blob = new Blob([text], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "anagrams.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearInput} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                            {anagrams.length > 0 ? (
                                anagrams.map((anagram, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-3 py-1 font-medium">{anagram}</Badge>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center justify-center w-full h-full min-h-[50px]">
                                    {input ? "No dictionary anagrams found" : "Enter text to find anagrams"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] flex flex-col border border-border rounded-xl overflow-hidden shadow-sm bg-card">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-3 py-2">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                            All Permutations
                            {permutations.length > 0 && (
                                <Badge variant="outline" className="font-mono bg-background text-muted-foreground ml-3 h-5 px-1.5 text-[10px] rounded-sm">
                                    {permutations.length}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {permutations.length > 0 && (
                                <>
                                    <CopyButton textToCopy={permutations.join('\n')} tooltipText="Copy Permutations" />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7" icon={Download} tooltipText="Download Permutations" onClickAction={() => {
                                                const text = permutations.join('\n');
                                                const blob = new Blob([text], { type: "text/plain" });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url; a.download = "permutations.txt"; document.body.appendChild(a); a.click();
                                                document.body.removeChild(a); URL.revokeObjectURL(url);
                                            }} />
                                    <AnimatedButton variant="ghost" size="icon" className="size-7 hover:bg-destructive/10 hover:text-destructive" icon={Trash2} tooltipText="Clear" onClickAction={clearInput} />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 pt-0">
                        <div className="flex flex-wrap gap-2">
                            {permutations.length > 0 ? (
                                permutations.map((perm, idx) => (
                                    <Badge key={idx} variant="outline" className="px-3 py-1 font-mono text-muted-foreground">{perm}</Badge>
                                ))
                            ) : input.replace(/[^a-zA-Z]/g, '').length > 7 ? (
                                <div className="text-sm text-muted-foreground flex items-center justify-center w-full h-full min-h-[50px] text-center px-4">
                                    Disabled for words longer than 7 characters (too many combinations)
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground flex items-center justify-center w-full h-full min-h-[50px]">
                                    {input ? "No permutations found" : "Enter text to see all permutations"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
