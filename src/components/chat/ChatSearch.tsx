import type React from "react";
import { Search, X, Loader2, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Message } from "./type";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: Message[];
  onResultClick: (messageId: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
}

export const ChatSearch: React.FC<ChatSearchProps> = ({
  searchTerm,
  onSearchChange,
  searchResults,
  onResultClick,
  onClearSearch,
  isSearching,
}) => {
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-yellow-900 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  // Only show the results panel when there's a search term
  const showResults = searchTerm.length > 0;

  return (
    <div
      className={`bg-white absolute w-full z-10 border-b border-slate-200 shadow-sm transition-all ${showResults ? "pb-3" : ""}`}
    >
      <div className="p-4">
        <div className="relative">
          {isSearching ? (
            <Loader2 className="absolute left-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          )}
          <Input
            placeholder="Search in conversation..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-10 bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-slate-300 focus:ring-slate-200"
          />
          {searchTerm && (
            <button
              onClick={onClearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showResults && (
        <div className="px-4">
          <div className="bg-slate-50 rounded-lg border border-slate-200">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {searchResults.length}{" "}
                  {searchResults.length === 1 ? "result" : "results"}
                </Badge>
                {isSearching && (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
                className="h-8 text-xs"
              >
                Clear
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <ScrollArea className="max-h-32 overflow-y-auto">
                <div className="p-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => onResultClick(String(result.id))}
                      className="w-full text-left p-3 hover:bg-white rounded-md transition-colors flex items-start gap-3 group border-l-4 border-transparent hover:border-blue-500"
                    >
                      <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-slate-900">
                          {highlightSearchTerm(result.content, searchTerm)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500 group-hover:text-blue-600">
                            {result.date}
                          </p>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <p className="text-xs text-slate-500 group-hover:text-blue-600">
                            {result.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-slate-500">No messages found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
