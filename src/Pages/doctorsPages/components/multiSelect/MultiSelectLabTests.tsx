import { useMemo, useState } from "react";
// import { labTests as initialTests } from "../../forms/labTests";
import { labTests } from "../forms/datas/LabTests";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Test = {
  id: number;
  name: string;
};

type Props = {
  testsData?: Test[];
  buttonLabel?: string;
  searchPlaceholder?: string;
  addLabel?: string;
  onChange?: (selected: Test[]) => void;
};

export default function MultiSelectLabTests({
  testsData = labTests,
  buttonLabel = "Search or select lab test",
  searchPlaceholder = "Search or add lab test...",
  addLabel = "Add",
  onChange,
}: Props) {
  const [tests, setTests] = useState<Test[]>(testsData);
  const [selected, setSelected] = useState<Test[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  // Normalize for comparison
  const normalize = (str: string) => str.trim().toLowerCase();

  // Add or select test
  const addOrSelectTest = () => {
    const value = input.trim();
    if (!value) return;

    const existing = tests.find(
      (t) => normalize(t.name) === normalize(value)
    );

    if (existing) {
      if (!selected.some((t) => t.id === existing.id)) {
        const updated = [...selected, existing];
        setSelected(updated);
        onChange?.(updated);
      }
    } else {
      const newTest = { id: Date.now(), name: value };
      const updatedTests = [...tests, newTest];
      const updatedSelected = [...selected, newTest];

      setTests(updatedTests);
      setSelected(updatedSelected);
      onChange?.(updatedSelected);
    }

    setInput("");
  };

  // Remove selected
  const removeTest = (id: number) => {
    const updated = selected.filter((t) => t.id !== id);
    setSelected(updated);
    onChange?.(updated);
  };

  const selectTest = (test: Test) => {
    if (!selected.some((t) => t.id === test.id)) {
      const updated = [...selected, test];
      setSelected(updated);
      onChange?.(updated);
    }
    setInput("");
    setOpen(false);
  };

  const filteredTests = useMemo(
    () =>
      tests.filter((t) => t.name.toLowerCase().includes(input.toLowerCase())),
    [tests, input]
  );

  return (
    <div className="w-full space-x-3 lg:flex">
      <div className="w-full max-w-[15rem]">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {input || buttonLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[18rem] p-0" align="start">
            <Command>
              <CommandInput
                value={input}
                onValueChange={setInput}
                placeholder={searchPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !filteredTests.length) {
                    e.preventDefault();
                    addOrSelectTest();
                    setOpen(false);
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>
                  <button
                    type="button"
                    onClick={addOrSelectTest}
                    className="w-full px-2 py-2 text-left text-sm text-blue-600"
                  >
                    {addLabel} "{input}"
                  </button>
                </CommandEmpty>
                {filteredTests.map((test) => (
                  <CommandItem
                    key={test.id}
                    value={test.name}
                    onSelect={() => selectTest(test)}
                  >
                    {test.name}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected */}
      <div className="flex flex-wrap gap-2 border p-2 rounded min-h-[40px] w-full">
        {selected.map((test) => (
          <span
            key={test.id}
            className="bg-cyan-100 text-cyan-900 text-[0.5rem] px-2 py-0 rounded-full flex items-center gap-2"
          >
            {test.name}
            <button
              onClick={() => removeTest(test.id)}
              className="text-red-500 text-[0.9rem]"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
