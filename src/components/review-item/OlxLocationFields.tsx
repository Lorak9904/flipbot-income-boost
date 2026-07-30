import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOlxCityDistricts, searchOlxCities, type OlxLocationOption } from '@/lib/api/olx';
import type { PlatformOverrides } from '@/types/item';

interface Props {
  countryCode: string;
  disabled: boolean;
  language?: string;
  value?: NonNullable<PlatformOverrides['olx']>['location'];
  onChange: (value: NonNullable<PlatformOverrides['olx']>['location']) => void;
  onDistrictRequirementChange: (state: OlxDistrictRequirementState) => void;
}

export type OlxDistrictRequirementState =
  | 'idle'
  | 'loading'
  | 'required'
  | 'not_required'
  | 'unavailable';

export default function OlxLocationFields({
  countryCode,
  disabled,
  language,
  value,
  onChange,
  onDistrictRequirementChange,
}: Props) {
  const isPolish = language === 'pl';
  const [query, setQuery] = useState(value?.city_name || '');
  const [cities, setCities] = useState<OlxLocationOption[]>([]);
  const [districts, setDistricts] = useState<OlxLocationOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityLoadFailed, setCityLoadFailed] = useState(false);
  const [cityRetryKey, setCityRetryKey] = useState(0);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [districtLoadFailed, setDistrictLoadFailed] = useState(false);
  const [districtRetryKey, setDistrictRetryKey] = useState(0);
  const [activeCityIndex, setActiveCityIndex] = useState(-1);
  const citySearchRequestIdRef = useRef(0);
  const cityOptionRefs = useRef(new Map<string | number, HTMLButtonElement>());
  const locationValueRef = useRef(value);
  locationValueRef.current = value;
  const cityId = value?.city_id ? String(value.city_id) : '';
  const cityListboxId = 'olx-city-options';
  const cityRequiredMessageId = 'olx-city-required';
  const districtRequiredMessageId = 'olx-district-required';
  const activeCity = activeCityIndex >= 0 ? cities[activeCityIndex] : undefined;

  useEffect(() => {
    if (query.trim().length < 2 || query === value?.city_name) {
      citySearchRequestIdRef.current += 1;
      setCities([]);
      setCityLoadFailed(false);
      setActiveCityIndex(-1);
      return;
    }
    const requestId = ++citySearchRequestIdRef.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (citySearchRequestIdRef.current !== requestId) return;
      setLoadingCities(true);
      setCityLoadFailed(false);
      try {
        const results = (
          await searchOlxCities({ query, countryCode, signal: controller.signal })
        ).results;
        if (controller.signal.aborted || citySearchRequestIdRef.current !== requestId) return;
        setCities(results);
        setActiveCityIndex(-1);
      } catch (error) {
        if (!controller.signal.aborted && citySearchRequestIdRef.current === requestId) {
          setCities([]);
          setCityLoadFailed(true);
          setActiveCityIndex(-1);
        }
      } finally {
        if (!controller.signal.aborted && citySearchRequestIdRef.current === requestId) {
          setLoadingCities(false);
        }
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cityRetryKey, countryCode, query, value?.city_name]);

  useEffect(() => {
    if (!activeCity) return;
    cityOptionRefs.current.get(activeCity.id)?.scrollIntoView({ block: 'nearest' });
  }, [activeCity]);

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      setLoadingDistricts(false);
      setDistrictLoadFailed(false);
      onDistrictRequirementChange('idle');
      return;
    }
    const controller = new AbortController();
    setDistricts([]);
    setLoadingDistricts(true);
    setDistrictLoadFailed(false);
    onDistrictRequirementChange('loading');
    void getOlxCityDistricts({ cityId, countryCode, signal: controller.signal })
      .then((payload) => {
        if (controller.signal.aborted) return;
        const results = payload.results || [];
        setDistricts(results);
        const currentLocation = locationValueRef.current;
        if (
          currentLocation?.district_id &&
          String(currentLocation.city_id) === cityId &&
          !results.some(
            (district) => String(district.id) === String(currentLocation.district_id)
          )
        ) {
          onChange({
            city_id: currentLocation.city_id,
            city_name: currentLocation.city_name,
          });
        }
        onDistrictRequirementChange(results.length > 0 ? 'required' : 'not_required');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setDistricts([]);
          setDistrictLoadFailed(true);
          onDistrictRequirementChange('unavailable');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDistricts(false);
      });
    return () => controller.abort();
  }, [cityId, countryCode, districtRetryKey, onChange, onDistrictRequirementChange]);

  const chooseCity = (city: OlxLocationOption) => {
    citySearchRequestIdRef.current += 1;
    setQuery(city.name);
    setCities([]);
    setCityLoadFailed(false);
    setActiveCityIndex(-1);
    onDistrictRequirementChange('loading');
    onChange({ city_id: city.id, city_name: city.name });
  };

  return (
    <div className="grid gap-4 rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="olx-city">{isPolish ? 'Miasto OLX' : 'OLX city'}</Label>
        <div className="relative">
          <Input
            id="olx-city"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={cityListboxId}
            aria-expanded={cities.length > 0}
            aria-haspopup="listbox"
            aria-activedescendant={activeCity ? `olx-city-option-${activeCity.id}` : undefined}
            aria-required="true"
            aria-describedby={!cityId ? cityRequiredMessageId : undefined}
            value={query}
            disabled={disabled}
            placeholder={isPolish ? 'Wpisz co najmniej 2 znaki' : 'Type at least 2 characters'}
            onChange={(event) => {
              citySearchRequestIdRef.current += 1;
              setQuery(event.target.value);
              setCities([]);
              setCityLoadFailed(false);
              setLoadingCities(false);
              setActiveCityIndex(-1);
              if (cityId) {
                onDistrictRequirementChange('idle');
                onChange(undefined);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                citySearchRequestIdRef.current += 1;
                setCities([]);
                setCityLoadFailed(false);
                setLoadingCities(false);
                setActiveCityIndex(-1);
                return;
              }

              if (cities.length === 0) return;

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveCityIndex((current) =>
                  current >= cities.length - 1 ? 0 : current + 1
                );
                return;
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveCityIndex((current) =>
                  current <= 0 ? cities.length - 1 : current - 1
                );
                return;
              }

              if (event.key === 'Enter' && activeCity) {
                event.preventDefault();
                chooseCity(activeCity);
              }
            }}
          />
          {loadingCities && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-neutral-400" />}
        </div>
        {!cityId && (
          <p id={cityRequiredMessageId} className="text-xs text-amber-300">
            {isPolish ? 'Miasto OLX jest wymagane przed publikacją.' : 'An OLX city is required before publishing.'}
          </p>
        )}
        {cityLoadFailed && (
          <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-red-300">
            <span>
              {isPolish
                ? 'Nie udało się wyszukać miast OLX.'
                : 'Could not search OLX cities.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 border-red-400/50 bg-transparent px-3 text-xs text-red-200 hover:bg-red-500/10 hover:text-red-100"
              disabled={disabled || loadingCities}
              onClick={() => setCityRetryKey((current) => current + 1)}
            >
              {isPolish ? 'Spróbuj ponownie' : 'Try again'}
            </Button>
          </div>
        )}
        {cities.length > 0 && (
          <div id={cityListboxId} role="listbox" className="max-h-44 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950 p-1">
            {cities.map((city, index) => (
              <button
                id={`olx-city-option-${city.id}`}
                key={city.id}
                type="button"
                ref={(element) => {
                  if (element) cityOptionRefs.current.set(city.id, element);
                  else cityOptionRefs.current.delete(city.id);
                }}
                role="option"
                tabIndex={-1}
                aria-selected={index === activeCityIndex}
                className="block w-full rounded px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800 aria-selected:bg-neutral-800"
                onMouseEnter={() => setActiveCityIndex(index)}
                onClick={() => chooseCity(city)}
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="olx-district">{isPolish ? 'Dzielnica OLX' : 'OLX district'}</Label>
        <Select
          disabled={disabled || !cityId || loadingDistricts || districts.length === 0}
          value={value?.district_id ? String(value.district_id) : undefined}
          onValueChange={(districtId) => {
            const district = districts.find((item) => String(item.id) === districtId);
            onChange({ ...value, district_id: districtId, district_name: district?.name });
          }}
        >
          <SelectTrigger
            id="olx-district"
            aria-required={districts.length > 0}
            aria-describedby={
              districts.length > 0 && !value?.district_id
                ? districtRequiredMessageId
                : undefined
            }
          >
            <SelectValue placeholder={loadingDistricts ? (isPolish ? 'Wczytywanie…' : 'Loading…') : districts.length ? (isPolish ? 'Wybierz dzielnicę' : 'Select district') : (isPolish ? 'Brak dzielnic' : 'No districts')} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {districts.length > 0 && !value?.district_id && <p id={districtRequiredMessageId} className="text-xs text-amber-300">{isPolish ? 'Dzielnica jest wymagana dla tego miasta.' : 'A district is required for this city.'}</p>}
        {districtLoadFailed && (
          <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-red-300">
            <span>
              {isPolish
                ? 'Nie udało się sprawdzić dzielnic OLX.'
                : 'Could not check OLX districts.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 border-red-400/50 bg-transparent px-3 text-xs text-red-200 hover:bg-red-500/10 hover:text-red-100"
              disabled={disabled || loadingDistricts}
              onClick={() => setDistrictRetryKey((current) => current + 1)}
            >
              {isPolish ? 'Spróbuj ponownie' : 'Try again'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
