import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getOlxCityDistricts, searchOlxCities, type OlxLocationOption } from '@/lib/api/olx';
import type { PlatformOverrides } from '@/types/item';

interface Props {
  countryCode: string;
  disabled: boolean;
  language?: string;
  value?: NonNullable<PlatformOverrides['olx']>['location'];
  onChange: (value: NonNullable<PlatformOverrides['olx']>['location']) => void;
}

export default function OlxLocationFields({ countryCode, disabled, language, value, onChange }: Props) {
  const isPolish = language === 'pl';
  const [query, setQuery] = useState(value?.city_name || '');
  const [cities, setCities] = useState<OlxLocationOption[]>([]);
  const [districts, setDistricts] = useState<OlxLocationOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const cityId = value?.city_id ? String(value.city_id) : '';
  const cityListboxId = 'olx-city-options';
  const cityRequiredMessageId = 'olx-city-required';
  const districtRequiredMessageId = 'olx-district-required';

  useEffect(() => {
    if (query.trim().length < 2 || query === value?.city_name) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingCities(true);
      try {
        setCities((await searchOlxCities({ query, countryCode, signal: controller.signal })).results);
      } catch (error) {
        if (!controller.signal.aborted) setCities([]);
      } finally {
        if (!controller.signal.aborted) setLoadingCities(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [countryCode, query, value?.city_name]);

  useEffect(() => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    const controller = new AbortController();
    setLoadingDistricts(true);
    void getOlxCityDistricts({ cityId, countryCode, signal: controller.signal })
      .then((payload) => setDistricts(payload.results))
      .catch(() => {
        if (!controller.signal.aborted) setDistricts([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDistricts(false);
      });
    return () => controller.abort();
  }, [cityId, countryCode]);

  const chooseCity = (city: OlxLocationOption) => {
    setQuery(city.name);
    setCities([]);
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
            aria-required="true"
            aria-describedby={!cityId ? cityRequiredMessageId : undefined}
            value={query}
            disabled={disabled}
            placeholder={isPolish ? 'Wpisz co najmniej 2 znaki' : 'Type at least 2 characters'}
            onChange={(event) => {
              setQuery(event.target.value);
              if (cityId) onChange(undefined);
            }}
          />
          {loadingCities && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-neutral-400" />}
        </div>
        {!cityId && (
          <p id={cityRequiredMessageId} className="text-xs text-amber-300">
            {isPolish ? 'Miasto OLX jest wymagane przed publikacją.' : 'An OLX city is required before publishing.'}
          </p>
        )}
        {cities.length > 0 && (
          <div id={cityListboxId} role="listbox" className="max-h-44 overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950 p-1">
            {cities.map((city) => (
              <button key={city.id} type="button" role="option" aria-selected={String(city.id) === cityId} className="block w-full rounded px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800" onClick={() => chooseCity(city)}>
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
            aria-required="true"
            aria-describedby={cityId && !value?.district_id ? districtRequiredMessageId : undefined}
          >
            <SelectValue placeholder={loadingDistricts ? (isPolish ? 'Wczytywanie…' : 'Loading…') : districts.length ? (isPolish ? 'Wybierz dzielnicę' : 'Select district') : (isPolish ? 'Brak dzielnic' : 'No districts')} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => <SelectItem key={district.id} value={String(district.id)}>{district.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {cityId && !loadingDistricts && !value?.district_id && <p id={districtRequiredMessageId} className="text-xs text-amber-300">{isPolish ? 'Dzielnica jest wymagana dla tego miasta.' : 'A district is required for this city.'}</p>}
      </div>
    </div>
  );
}
