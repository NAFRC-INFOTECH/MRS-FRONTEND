import { useSearch } from "@/contexts/SearchContext";

export default function Searchbar() {
  const { query, setQuery } = useSearch();
    return (
      <div className="max-w-[20rem] lg:min-w-[30rem] w-full h-[2.4rem] border-2 border-gray-100/20 rounded-md overflow-hidden">
        <input
          type="text"
          placeholder="Search by name here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-full px-2 text-gray-400 bg-gray-50/20 outline-none focus:outline-none"
        />
      </div>
    );
  }