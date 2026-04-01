import { useState } from "react";
// import { createClient } from '@/utils/supabase/client'

interface SearchResults {
  loans: Array<Record<string, unknown>>;
  clients: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (query: string) => {
    if (!query || query.length < 3) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    try {
      // Mock implementation for now
      // const supabase = createClient()
      // const { data } = await supabase.from('loans').select('*').textSearch('fts', query)

      console.log("Searching for:", query);

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setResults({
        loans: [],
        clients: [],
        payments: [],
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { search, results, isLoading };
}
