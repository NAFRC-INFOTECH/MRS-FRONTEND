import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePatientMutation } from "@/api-integration/mutations/patients";
import { toast } from "sonner";
import countriesJson from "../../Countries/countries.json";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";

type CountriesData = Record<string, Array<{ state: string; lgas?: string[] }>>;
const COUNTRIES: CountriesData = countriesJson as CountriesData;

export default function PatientsBiodataPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatientMutation();
  const [category, setCategory] = useState<"civilian" | "veteran">("civilian");
  const [surname, setSurname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [rank, setRank] = useState("");
  const [sex, setSex] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobDate, setDobDate] = useState<Date | undefined>(undefined);
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [lga, setLga] = useState("");
  const [address, setAddress] = useState("");
  const [religion, setReligion] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [genotype, setGenotype] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("");
  const [nokPhone, setNokPhone] = useState("");
  const [nokAddress, setNokAddress] = useState("");

  const countryNames = Object.keys(COUNTRIES);
  const statesList = (COUNTRIES[country] || []).map((s) => s.state);
  const lgasForState =
    (COUNTRIES[country] || []).find((s) => s.state === stateOfOrigin)?.lgas || [];

  useEffect(() => {
    const srcDate = dobDate ?? (dateOfBirth ? new Date(dateOfBirth) : undefined);
    if (!srcDate || isNaN(srcDate.getTime())) return;
    const dob = new Date(srcDate);
    if (isNaN(dob.getTime())) return;
    const diffMs = Date.now() - dob.getTime();
    const years = Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
    setAge(String(Math.max(0, years)));
  }, [dobDate, dateOfBirth]);

  const onSubmit = () => {
    const payload = {
      surname,
      firstname,
      lastname,
      veteran: category === "veteran",
      serviceNumber: category === "veteran" ? serviceNumber : "",
      rank: category === "veteran" ? rank : "",
      sex,
      age: age ? Number(age) : undefined,
      dateOfBirth: dateOfBirth || undefined,
      country: country || undefined,
      stateOfOrigin: stateOfOrigin || undefined,
      lga: lga || undefined,
      address: address || undefined,
      religion: religion || undefined,
      maritalStatus: maritalStatus || undefined,
      phone: phone || undefined,
      occupation: occupation || undefined,
      genotype: genotype || undefined,
      bloodGroup: bloodGroup || undefined,
      nok: {
        name: nokName || undefined,
        relationship: nokRelationship || undefined,
        phone: nokPhone || undefined,
        address: nokAddress || undefined,
      },
    };
    createPatient.mutate(payload as any, {
      onSuccess: () => {
        toast.success("Patient created");
        navigate("/recordings/patients-registry");
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        toast.error(msg || "Failed to create patient");
      },
    });
  };

  return (
    <div className="py-4 w-full">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Register New Patient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <Button variant={category === "civilian" ? "default" : "outline"} onClick={() => { setCategory("civilian"); setServiceNumber(""); setRank(""); }}>
                Civilian
              </Button>
              <Button variant={category === "veteran" ? "default" : "outline"} onClick={() => setCategory("veteran")}>
                Veteran
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
            <Input placeholder="Firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
            <Input placeholder="Lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} />
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Sex" /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? dateOfBirth : "Pick Date of Birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  onSelect={(d) => {
                    setDobDate(d);
                    if (d) setDateOfBirth(d.toISOString().slice(0, 10));
                  }}
                />
              </PopoverContent>
            </Popover>
            <Input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            {category === "veteran" && (
              <>
                <Input placeholder="Service Number" value={serviceNumber} onChange={(e) => setServiceNumber(e.target.value)} />
                <Input placeholder="Rank" value={rank} onChange={(e) => setRank(e.target.value)} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={country} onValueChange={(v) => { setCountry(v); setStateOfOrigin(""); setLga(""); }}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Country" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {countryNames.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectGroup></SelectContent>
            </Select>
            <Select value={stateOfOrigin} onValueChange={(v) => { setStateOfOrigin(v); setLga(""); }} disabled={!statesList.length}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select State" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {statesList.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectGroup></SelectContent>
            </Select>
            <Select value={lga} onValueChange={setLga} disabled={!lgasForState.length}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select LGA" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {lgasForState.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
              </SelectGroup></SelectContent>
            </Select>
            <Input placeholder="Residential Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={religion} onValueChange={setReligion}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Religion" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="christianity">Christianity</SelectItem>
                  <SelectItem value="islam">Islam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={maritalStatus} onValueChange={setMaritalStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Marital Status" /></SelectTrigger>
              <SelectContent><SelectGroup>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectGroup></SelectContent>
            </Select>
            <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            <Select value={genotype} onValueChange={setGenotype}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Genotype" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {["AA","AS","SS","AC","SC"].map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
              </SelectGroup></SelectContent>
            </Select>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Blood Group" /></SelectTrigger>
              <SelectContent><SelectGroup>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
              </SelectGroup></SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader><CardTitle>Next Of Kin</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="NOK Name" value={nokName} onChange={(e) => setNokName(e.target.value)} />
              <Select value={nokRelationship} onValueChange={setNokRelationship}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Relationship" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
              <Input placeholder="NOK Phone" value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} />
              <Input placeholder="NOK Address" value={nokAddress} onChange={(e) => setNokAddress(e.target.value)} />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80" type="button" onClick={onSubmit} disabled={createPatient.isPending}>
              {createPatient.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
