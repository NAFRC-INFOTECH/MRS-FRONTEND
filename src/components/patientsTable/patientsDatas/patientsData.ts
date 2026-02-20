import type { Patient } from "./types";

export const dummyPatients: Patient[] = [
  {
    personalInfo: {
      id: "PAT-1001",
      fullName: "John Doe",
      imageUrl: "https://randomuser.me/api/portraits/men/51.jpg",
      phone: "+234 901 234 5678",
      email: "john.doe@example.com",
      address: "12 Maple Street, Lagos, Nigeria",
      status: "active",
      condition: "on medication",
    },
  },
  {
    personalInfo: {
      id: "PAT-1002",
      fullName: "Jane Smith",
      imageUrl: "https://randomuser.me/api/portraits/women/52.jpg",
      phone: "+234 902 345 6789",
      email: "jane.smith@example.com",
      address: "45 Banana Avenue, Abuja, Nigeria",
      status: "inactive",
      condition: "on sick bed",
    },
  },
  {
    personalInfo: {
      id: "PAT-1003",
      fullName: "David Johnson",
      imageUrl: "https://randomuser.me/api/portraits/men/53.jpg",
      phone: "+234 903 456 7890",
      email: "david.johnson@example.com",
      address: "78 Palm Road, Port Harcourt, Nigeria",
      status: "discharged",
      condition: "discharged",
    },
  },
  {
    personalInfo: {
      id: "PAT-1004",
      fullName: "Clara Evans",
      imageUrl: "https://randomuser.me/api/portraits/women/54.jpg",
      phone: "+234 904 567 8901",
      email: "clara.evans@example.com",
      address: "90 Pine Street, Ibadan, Nigeria",
      status: "active",
      condition: "recovered",
    },
  },
];