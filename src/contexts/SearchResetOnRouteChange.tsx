import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

export const SearchResetOnRouteChange = () => {
  const location = useLocation();
  const { setQuery } = useSearch();

  useEffect(() => {
    setQuery("");
  }, [location.pathname]);

  return null;
};