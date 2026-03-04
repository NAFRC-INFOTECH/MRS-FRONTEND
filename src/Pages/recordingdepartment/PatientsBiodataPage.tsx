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
  const [category, setCategory] = useState<"civilian" | "personnel">("personnel");
  const [surname, setSurname] = useState("");
  const [firstname, setFirstname] = useState("");
  const [middlename, setMiddlename] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [rank, setRank] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
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
    const missing: string[] = [];
    if (!surname.trim()) missing.push("Surname");
    if (!firstname.trim()) missing.push("First name");
    if (!sex) missing.push("Sex");
    if (!dateOfBirth) missing.push("Date of Birth");
    if (!age) missing.push("Age");
    if (!phone.trim()) missing.push("Phone Number");
    if (!maritalStatus) missing.push("Marital Status");
    if (!country) missing.push("Country");
    if (!stateOfOrigin) missing.push("State");
    if (category === "civilian") {
      if (!membershipNumber.trim()) missing.push("Membership Number");
    } else {
      if (!serviceNumber.trim()) missing.push("Service Number");
      if (!rank.trim()) missing.push("Rank");
    }
    if (missing.length > 0) {
      toast.error(`Please complete required fields: ${missing.join(", ")}`);
      return;
    }
    const payload = {
      surname,
      firstname,
      middlename,
      veteran: category === "personnel",
      serviceNumber: category === "personnel" ? serviceNumber : "",
      rank: category === "personnel" ? rank : "",
      membershipNumber: category === "civilian" ? membershipNumber : "",
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
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Category</label>
              <div className="flex gap-3">
                <Button variant="outline"	
                className={category === "personnel" ? "bg-[#56bbe3] text-white" : ""}
                  onClick={() => setCategory("personnel")}
                >
                  Personnel
                </Button>
                <Button variant="outline"
                  className={category === "civilian" ? "bg-[#56bbe3] text-white" : ""}
                  onClick={() => { setCategory("civilian"); setServiceNumber(""); setRank(""); }}
                >
                  Civilian
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Surname</label>
              <Input placeholder="Enter Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">First Name</label>
              <Input placeholder="Enter First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Middle Name</label>
              <Input placeholder="Enter Middle Name" value={middlename} onChange={(e) => setMiddlename(e.target.value)} />
            </div>
            {category === "civilian" && (
              <div className="flex flex-col gap-1 md:col-span-3">
                <label className="text-sm text-gray-600">Membership Number</label>
                <Input placeholder="e.g., 26/01" value={membershipNumber} onChange={(e) => setMembershipNumber(e.target.value)} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Sex</label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Sex" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <Popover>
              <div className="">
                <label className="text-sm text-gray-600">D.O.B</label>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-gray-500">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? dateOfBirth : "Pick Date of Birth"}
                  </Button>
                </PopoverTrigger>
              </div>
              <PopoverContent align="start" className="p-0">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  captionLayout="dropdown"
                  fromYear={1930}
                  toYear={new Date().getFullYear()}
                  showOutsideDays
                  onSelect={(d) => {
                    setDobDate(d);
                    if (d) setDateOfBirth(d.toISOString().slice(0, 10));
                  }}
                />
              </PopoverContent>
            </Popover>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Age</label>
              <Input placeholder="Enter Age" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            {category === "personnel" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Service Number</label>
                  <Input placeholder="Enter Service Number" value={serviceNumber} onChange={(e) => setServiceNumber(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Rank</label>
                  <Input placeholder="Enter Rank" value={rank} onChange={(e) => setRank(e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Country</label>
              <Select value={country} onValueChange={(v) => { setCountry(v); setStateOfOrigin(""); setLga(""); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Country" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {countryNames.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">State</label>
              <Select value={stateOfOrigin} onValueChange={(v) => { setStateOfOrigin(v); setLga(""); }} disabled={!statesList.length}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {statesList.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">LGA</label>
              <Select value={lga} onValueChange={setLga} disabled={!lgasForState.length}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select LGA" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {lgasForState.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-3">
              <label className="text-sm text-gray-600">Residential Address</label>
              <Input placeholder="Enter Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Religion</label>
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
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Marital Status</label>
              <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Marital Status" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Phone Number</label>
              <Input placeholder="Enter Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Occupation</label>
              <Input placeholder="Enter Occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Genotype</label>
              <Select value={genotype} onValueChange={setGenotype}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Genotype" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {["AA","AS","SS","AC","SC"].map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                </SelectGroup></SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600">Blood Group</label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Blood Group" /></SelectTrigger>
                <SelectContent><SelectGroup>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                </SelectGroup></SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle>Next Of Kin</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-0">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">NOK Name</label>
                <Input placeholder="Enter NOK Name" value={nokName} onChange={(e) => setNokName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">Relationship</label>
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
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">NOK Phone</label>
                <Input placeholder="Enter NOK Phone" value={nokPhone} onChange={(e) => setNokPhone(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600">NOK Address</label>
                <Input placeholder="Enter NOK Address" value={nokAddress} onChange={(e) => setNokAddress(e.target.value)} />
              </div>
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
