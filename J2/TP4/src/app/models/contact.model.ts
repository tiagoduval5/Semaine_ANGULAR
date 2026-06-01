export interface Contact {
  id: number;
  nom: string;
  email: string;
  tel: string;
}

export type NouveauContact = Omit<Contact, 'id'>;
