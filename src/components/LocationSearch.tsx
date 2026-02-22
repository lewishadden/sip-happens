'use client';

import Script from 'next/script';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface LocationData {
  place_id: string;
  formatted_address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface LocationSearchProps {
  initialValue?: string;
  initialLocationData?: LocationData | null;
  onChange: (result: { display: string; data: LocationData | null }) => void;
}

declare global {
  interface Window {
    google: typeof google;
    __googlePlacesLoaded?: boolean;
  }
}

export default function LocationSearch({
  initialValue = '',
  initialLocationData,
  onChange,
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google?.maps?.places) return;
    if (autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.geometry || !place.address_components) {
        onChangeRef.current({
          display: inputRef.current?.value || '',
          data: null,
        });
        return;
      }

      let city = '';
      let country = '';

      for (const component of place.address_components) {
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (!city && component.types.includes('postal_town')) {
          city = component.long_name;
        }
        if (!city && component.types.includes('administrative_area_level_1')) {
          city = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      const display = [city, country].filter(Boolean).join(', ');
      const data: LocationData = {
        place_id: place.place_id || '',
        formatted_address: place.formatted_address || '',
        city,
        country,
        lat: place.geometry.location!.lat(),
        lng: place.geometry.location!.lng(),
      };

      setInputValue(display);
      onChangeRef.current({ display, data });
    });
  }, []);

  useEffect(() => {
    if (scriptLoaded || window.google?.maps?.places) {
      initAutocomplete();
    }
  }, [scriptLoaded, initAutocomplete]);

  function handleManualChange(value: string) {
    setInputValue(value);
    onChangeRef.current({ display: value, data: initialLocationData ?? null });
  }

  if (!apiKey) {
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleManualChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
        placeholder="London, United Kingdom"
      />
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="lazyOnload"
        onReady={() => setScriptLoaded(true)}
      />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => handleManualChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-ivory-mist-dark focus:outline-none focus:ring-2 focus:ring-caramel focus:border-transparent text-dark-espresso"
        placeholder="Search for a location..."
      />
    </>
  );
}
