export type UserRole = "rescatista" | "adoptante";

export type PetSpecies = "perro" | "gato";

export type PetSize = "pequeno" | "mediano" | "grande" | "gigante";

export type PetStatus = "disponible" | "en_proceso" | "adoptado";

export type RequestStatus = "pendiente" | "aceptada" | "rechazada";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  city: string;
  role: UserRole;
  created_at: string;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  age_months: number;
  sex: "macho" | "hembra";
  size: PetSize;
  description: string;
  photos: string[];
  status: PetStatus;
  city: string;
  state: string | null;
  recovery_fee: boolean;
  vaccinated: boolean;
  sterilized: boolean;
  rescuer_id: string;
  created_at: string;
}

export interface AdoptionRequest {
  id: string;
  adopter_id: string;
  pet_id: string;
  message: string;
  status: RequestStatus;
  created_at: string;
  pet?: Pet;
  adopter?: Profile;
}

export interface Conversation {
  id: string;
  request_id: string;
  rescuer_id: string;
  adopter_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
