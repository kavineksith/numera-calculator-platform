// src/components/calculator/AdvancedCalculator.tsx
// Advanced calculator with expandable sections: number theory, statistics,
// fractions, programmer (base conversion + bitwise), unit conversion, date
// diff, and random. Each section is a small self-contained form.

"use client";

import { useState } from "react";
import {
  numberTheory,
  statistics,
  programmer,
  fractions,
  units,
  Decimal,
} from "@/engine";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Result({ label, value }: { label: string; value: string | null }) {
  if (value === null) return null;
  return (
    <div className="mt-2 rounded-md border border-[var(--calc-border)] bg-[var(--calc-surface)] p-2 text-sm">
      <span className="opacity-70">{label}: </span>
      <span className="font-mono font-semibold break-all">{value}</span>
    </div>
  );
}

export function AdvancedCalculator() {
  // Number theory
  const [gcdA, setGcdA] = useState("12");
  const [gcdB, setGcdB] = useState("18");
  const [primeN, setPrimeN] = useState("97");
  const [pfN, setPfN] = useState("360");
  const [permN, setPermN] = useState("5");
  const [permK, setPermK] = useState("2");
  const [ntResult, setNtResult] = useState<Record<string, string | null>>({});

  // Statistics
  const [statsInput, setStatsInput] = useState("1 2 3 4 5");
  const [stats, setStats] = useState<ReturnType<typeof statistics.describeAll> | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);

  // Fractions
  const [fracInput, setFracInput] = useState("0.75");
  const [fracResult, setFracResult] = useState<string | null>(null);

  // Programmer
  const [progValue, setProgValue] = useState("255");
  const [progBase, setProgBase] = useState<"2" | "8" | "10" | "16">("10");
  const [progA, setProgA] = useState("5");
  const [progB, setProgB] = useState("3");
  const [progResult, setProgResult] = useState<Record<string, string | null>>({});

  // Unit conversion
  const [unitVal, setUnitVal] = useState("1");
  const [unitCat, setUnitCat] = useState<"length" | "mass" | "temperature">("length");
  const [unitFrom, setUnitFrom] = useState("m");
  const [unitTo, setUnitTo] = useState("ft");
  const [unitResult, setUnitResult] = useState<string | null>(null);

  // Date diff
  const [dateA, setDateA] = useState(new Date().toISOString().slice(0, 10));
  const [dateB, setDateB] = useState(new Date().toISOString().slice(0, 10));
  const [dateResult, setDateResult] = useState<string | null>(null);

  // Random
  const [randMin, setRandMin] = useState("1");
  const [randMax, setRandMax] = useState("100");
  const [randResult, setRandResult] = useState<string | null>(null);

  const runNt = (key: string, fn: () => string) => {
    try {
      setNtResult((p) => ({ ...p, [key]: fn() }));
    } catch (e) {
      setNtResult((p) => ({ ...p, [key]: `Error: ${e instanceof Error ? e.message : e}` }));
    }
  };

  const runStats = () => {
    try {
      const xs = statistics.parseNumberList(statsInput);
      setStats(statistics.describeAll(xs));
      setStatsErr(null);
    } catch (e) {
      setStats(null);
      setStatsErr(e instanceof Error ? e.message : String(e));
    }
  };

  const runFrac = () => {
    try {
      const d = new Decimal(fracInput);
      setFracResult(
        `fraction = ${fractions.toFractionString(d)} | mixed = ${fractions.toMixedNumberString(d)}`,
      );
    } catch (e) {
      setFracResult(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  const runProgConvert = () => {
    try {
      const v = programmer.parsePrefixed(progValue);
      setProgResult((p) => ({
        ...p,
        convert: `BIN: ${programmer.toBase(v, 2)}\nOCT: ${programmer.toBase(v, 8)}\nDEC: ${programmer.toBase(v, 10)}\nHEX: ${programmer.toBase(v, 16)}`,
      }));
    } catch (e) {
      setProgResult((p) => ({ ...p, convert: `Error: ${e instanceof Error ? e.message : e}` }));
    }
  };

  const runBitwise = (op: string) => {
    try {
      const a = programmer.parsePrefixed(progA);
      const b = programmer.parsePrefixed(progB);
      let r = 0;
      if (op === "AND") r = programmer.bitwiseAnd(a, b);
      if (op === "OR") r = programmer.bitwiseOr(a, b);
      if (op === "XOR") r = programmer.bitwiseXor(a, b);
      setProgResult((p) => ({ ...p, [op]: `${r} (0x${programmer.toBase(r, 16)}, 0b${programmer.toBase(r, 2)})` }));
    } catch (e) {
      setProgResult((p) => ({ ...p, [op]: `Error: ${e instanceof Error ? e.message : e}` }));
    }
  };

  const runUnit = () => {
    try {
      const v = Number(unitVal);
      const r = units.convert(v, unitFrom, unitTo, unitCat);
      setUnitResult(`${v} ${unitFrom} = ${r} ${unitTo}`);
    } catch (e) {
      setUnitResult(`Error: ${e instanceof Error ? e.message : e}`);
    }
  };

  const runDate = () => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    const days = Math.round((b.getTime() - a.getTime()) / 86_400_000);
    setDateResult(`${days} days between ${dateA} and ${dateB}`);
  };

  const runRandom = () => {
    const lo = Number(randMin);
    const hi = Number(randMax);
    const r = Math.floor(Math.random() * (hi - lo + 1)) + lo;
    setRandResult(String(r));
  };

  return (
    <Accordion type="multiple" defaultValue={["number-theory"]} className="w-full">
      {/* Number theory */}
      <AccordionItem value="number-theory">
        <AccordionTrigger className="text-sm">Number Theory</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">a</Label>
              <Input value={gcdA} onChange={(e) => setGcdA(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">b</Label>
              <Input value={gcdB} onChange={(e) => setGcdB(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => runNt("gcd", () => String(numberTheory.gcd(Number(gcdA), Number(gcdB))))}>GCD</Button>
            <Button size="sm" onClick={() => runNt("lcm", () => String(numberTheory.lcm(Number(gcdA), Number(gcdB))))}>LCM</Button>
          </div>
          <Result label="GCD" value={ntResult.gcd ?? null} />
          <Result label="LCM" value={ntResult.lcm ?? null} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">n (primality)</Label>
              <Input value={primeN} onChange={(e) => setPrimeN(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={() => runNt("prime", () => numberTheory.isPrime(Number(primeN)) ? "prime" : "composite")}>isPrime</Button>
            </div>
          </div>
          <Result label="isPrime" value={ntResult.prime ?? null} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">n (factorisation)</Label>
              <Input value={pfN} onChange={(e) => setPfN(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={() => runNt("pf", () => numberTheory.primeFactorizationString(Number(pfN)))}>Factorise</Button>
            </div>
          </div>
          <Result label="prime factorisation" value={ntResult.pf ?? null} />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">n</Label>
              <Input value={permN} onChange={(e) => setPermN(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">k</Label>
              <Input value={permK} onChange={(e) => setPermK(e.target.value)} />
            </div>
            <div className="flex items-end gap-1">
              <Button size="sm" onClick={() => runNt("perm", () => numberTheory.perm(Number(permN), Number(permK)).toString())}>P(n,k)</Button>
              <Button size="sm" onClick={() => runNt("comb", () => numberTheory.comb(Number(permN), Number(permK)).toString())}>C(n,k)</Button>
            </div>
          </div>
          <Result label="P(n,k)" value={ntResult.perm ?? null} />
          <Result label="C(n,k)" value={ntResult.comb ?? null} />
        </AccordionContent>
      </AccordionItem>

      {/* Statistics */}
      <AccordionItem value="statistics">
        <AccordionTrigger className="text-sm">Statistics</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <Label className="text-xs">Values (comma or space separated)</Label>
          <Input value={statsInput} onChange={(e) => setStatsInput(e.target.value)} />
          <Button size="sm" onClick={runStats}>Compute</Button>
          {statsErr && <Result label="Error" value={statsErr} />}
          {stats && (
            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
              <div>count: {stats.count}</div>
              <div>sum: {stats.sum}</div>
              <div>mean: {stats.mean}</div>
              <div>median: {stats.median}</div>
              <div>mode: {stats.mode}</div>
              <div>min: {stats.min}</div>
              <div>max: {stats.max}</div>
              <div>range: {stats.range}</div>
              <div>var (sample): {stats.varianceSample.toFixed(4)}</div>
              <div>σ (sample): {stats.stddevSample.toFixed(4)}</div>
              <div>var (pop): {stats.variancePopulation.toFixed(4)}</div>
              <div>σ (pop): {stats.stddevPopulation.toFixed(4)}</div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Fractions */}
      <AccordionItem value="fractions">
        <AccordionTrigger className="text-sm">Fractions</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <Label className="text-xs">Decimal value</Label>
          <Input value={fracInput} onChange={(e) => setFracInput(e.target.value)} />
          <Button size="sm" onClick={runFrac}>Convert</Button>
          <Result label="result" value={fracResult} />
        </AccordionContent>
      </AccordionItem>

      {/* Programmer */}
      <AccordionItem value="programmer">
        <AccordionTrigger className="text-sm">Programmer</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <Label className="text-xs">Value (supports 0x/0b/0o prefixes)</Label>
          <Input value={progValue} onChange={(e) => setProgValue(e.target.value)} />
          <Button size="sm" onClick={runProgConvert}>Convert to all bases</Button>
          <Result label="bases" value={progResult.convert ?? null} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">a</Label>
              <Input value={progA} onChange={(e) => setProgA(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">b</Label>
              <Input value={progB} onChange={(e) => setProgB(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => runBitwise("AND")}>a AND b</Button>
            <Button size="sm" onClick={() => runBitwise("OR")}>a OR b</Button>
            <Button size="sm" onClick={() => runBitwise("XOR")}>a XOR b</Button>
          </div>
          <Result label="AND" value={progResult.AND ?? null} />
          <Result label="OR" value={progResult.OR ?? null} />
          <Result label="XOR" value={progResult.XOR ?? null} />
        </AccordionContent>
      </AccordionItem>

      {/* Unit conversion */}
      <AccordionItem value="units">
        <AccordionTrigger className="text-sm">Unit Conversion</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Value</Label>
              <Input value={unitVal} onChange={(e) => setUnitVal(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input value={unitFrom} onChange={(e) => setUnitFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input value={unitTo} onChange={(e) => setUnitTo(e.target.value)} />
            </div>
          </div>
          <Select value={unitCat} onValueChange={(v) => setUnitCat(v as typeof unitCat)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="length">length</SelectItem>
              <SelectItem value="mass">mass</SelectItem>
              <SelectItem value="temperature">temperature</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={runUnit}>Convert</Button>
          <Result label="result" value={unitResult} />
          <p className="text-[11px] opacity-70">
            Length: mm cm m km in ft yd mi. Mass: mg g kg t oz lb. Temperature: C F K.
          </p>
        </AccordionContent>
      </AccordionItem>

      {/* Date diff */}
      <AccordionItem value="date">
        <AccordionTrigger className="text-sm">Date Calculation</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={runDate}>Days between</Button>
          <Result label="result" value={dateResult} />
        </AccordionContent>
      </AccordionItem>

      {/* Random */}
      <AccordionItem value="random">
        <AccordionTrigger className="text-sm">Random Number</AccordionTrigger>
        <AccordionContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min (inclusive)</Label>
              <Input value={randMin} onChange={(e) => setRandMin(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Max (inclusive)</Label>
              <Input value={randMax} onChange={(e) => setRandMax(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={runRandom}>Generate</Button>
          <Result label="random" value={randResult} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
