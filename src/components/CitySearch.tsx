import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface CitySearchProps {
  value: string;
  onChange: (value: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  className?: string;
}

export function CitySearch({ value, onChange, placeholder = "Busca tu ciudad...", className }: CitySearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2 && isOpen) {
        searchCities(query);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCities = async (q: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5&accept-language=es`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (city: CitySuggestion) => {
    const cityName = city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0];
    const fullLabel = `${cityName}, ${city.address.country || ''}`;
    
    setQuery(fullLabel);
    onChange(fullLabel, parseFloat(city.lat), parseFloat(city.lon));
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-secondary/50 border-border"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
          ) : query ? (
            <button onClick={() => { setQuery(""); onChange(""); }}>
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          ) : (
            <Search className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden"
          >
            {suggestions.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(city)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex flex-col"
              >
                <span className="text-sm font-medium text-foreground">
                  {city.address.city || city.address.town || city.address.village || city.display_name.split(',')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {city.display_name}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
