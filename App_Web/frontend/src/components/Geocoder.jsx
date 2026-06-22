import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Loader2 } from "lucide-react";
import "../App.css";

export default function Geocoder({
    placeholder,
    onSelect,
    value = "",
    onClear
}) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dropdownPos, setDropdownPos] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (value === "" && query !== "") {
            setQuery("");
            setResults([]);
            setIsOpen(false);
        }
    }, [value]);

    useEffect(() => {
        if (isOpen && wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [isOpen, results]);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                setLoading(true);

                const url = new URL(
                    "https://nominatim.openstreetmap.org/search"
                );

                url.searchParams.set("q", query);
                url.searchParams.set("format", "jsonv2");
                url.searchParams.set("limit", "5");
                url.searchParams.set("countrycodes", "mx");
                url.searchParams.set("addressdetails", "1");

                const response = await fetch(url, {
                    headers: { Accept: "application/json" }
                });

                const data = await response.json();

                setResults(data);
                setIsOpen(data.length > 0);
            } catch (error) {
                console.error(error);
                setResults([]);
                setIsOpen(false);
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target) &&
                !e.target.closest(".geocoder-results-portal")
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(place) {
        const lat = Number(place.lat);
        const lon = Number(place.lon);

        setQuery(place.display_name);
        setResults([]);
        setIsOpen(false);

        onSelect([lat, lon]);
    }

    function handleChange(e) {
        setQuery(e.target.value);
        if (onClear) onClear();
    }

    return (
        <div className="geocoder" ref={wrapperRef}>
            <div className="geocoder-input-wrapper">
                <MapPin size={16} />

                <input
                    className="geocoder-input"
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                />

                {loading && <Loader2 className="spin" size={16} />}
            </div>

            {isOpen &&
                results.length > 0 &&
                dropdownPos &&
                createPortal(
                    <div
                        className="geocoder-results geocoder-results-portal"
                        style={{
                            position: "absolute",
                            top: `${dropdownPos.top}px`,
                            left: `${dropdownPos.left}px`,
                            width: `${dropdownPos.width}px`
                        }}
                    >
                        {results.map((place) => (
                            <button
                                key={place.place_id}
                                className="geocoder-item"
                                onClick={() => handleSelect(place)}
                            >
                                {place.display_name}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    );
}