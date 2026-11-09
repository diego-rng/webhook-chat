'use client';

import { useCallback, useRef, useState } from 'react';
import { MultiValue } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { findUser } from '../actions/findUser.ts';
import type { ClassNamesConfig } from 'react-select';
import type User from "../../types/User.ts";

export type UserOption = { value: string; label: string };

const pickerClassNames: ClassNamesConfig<UserOption, true> = {
  container: () => 'w-full min-w-82 max-w-md cursor-text',
  control: (state) =>
    `min-h-10 w-full rounded-2xl border bg-light-gray px-1 cursor-text ${
      state.isFocused
        ? 'border-gray-700 ring-1 ring-gray-700'
        : 'border-gray-500'
    }`,
  valueContainer: () => 'flex flex-wrap items-center gap-1 p-1',
  placeholder: () => 'px-2 text-gray-500',
  input: () => 'px-1',
  multiValue: () =>
    'flex items-center px-2 py-1 font-semibold bg-light-gray border border-gray-500 rounded-full',
  multiValueLabel: () => 'px-1',
  multiValueRemove: () =>
    'ml-1 cursor-pointer rounded-full px-1 hover:bg-gray-100 hover:text-gray-900',
  menu: () =>
    'mt-1 overflow-hidden rounded-2xl border border-gray-500 bg-light-gray shadow-lg',
  menuList: () => 'p-1',
  option: (state) =>
    `px-3 py-1 font-semibold cursor-pointer rounded-full ${
      state.isFocused ? 'bg-gray-100 text-gray-900' : 'text-white'
    }`,
  noOptionsMessage: () => 'px-3 py-2 text-gray-500',
  loadingMessage: () => 'px-3 py-2 text-gray-500',
  clearIndicator: () => 'cursor-pointer px-2 text-gray-500 hover:text-gray-300',
  loadingIndicator: () => 'px-2 text-gray-500',
  indicatorSeparator: () => 'hidden',
  dropdownIndicator: () => 'hidden',
};

export default function ParticipantPicker({
  onChange,
  initialMembers
}: {
  onChange?: (users: readonly UserOption[]) => void;
  initialMembers: User[];
}) {
  const [selected, setSelected] = useState<MultiValue<UserOption>>(initialMembers.map((u) => ({value: u.userId, label: u.username})));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadOptions = useCallback(
    (input: string, callback: (options: UserOption[]) => void) => {
      clearTimeout(timer.current);
      if (!input.trim()) return callback([]);

      timer.current = setTimeout(async () => {
        try {
          callback(await findUser(input));
        } catch (err) {
          console.error(err);
          callback([]);
        }
      }, 300);
    },
    [],
  );
  return (
    <AsyncCreatableSelect<UserOption, true>
      instanceId="participant-picker"
      isMulti
      cacheOptions
      loadOptions={loadOptions}
      value={selected}
      onChange={(v) => {
        setSelected(v);
        onChange?.(v);
      }}
      unstyled
      classNames={pickerClassNames}
      placeholder="Type a username, press Enter to confirm."
      noOptionsMessage={({ inputValue }) =>
        inputValue ? 'No users found!' : 'Start typing to search'
      }
      isValidNewOption={(input, selectedValues, opts) => {
        const name = input.trim().toLowerCase();
        return (
          /^[a-z0-9_]{3,20}$/i.test(name) &&
          !opts.some((o) => 'value' in o && o.label.toLowerCase() === name) &&
          !selectedValues.some((s) => s.label.toLowerCase() === name)
        );
      }}
      getNewOptionData={(input) => ({
        value: `new: ${input}`,
        label: input,
      })}
    />
  );
}
