import type { Audience, Priority, RequestStatus, RequestType } from './types';

// The same lists the API accepts.
export const REQUEST_TYPES: RequestType[] = ['Equipment', 'Software', 'Access'];
export const STATUSES: RequestStatus[] = ['Submitted', 'Approved', 'Rejected', 'Cancelled'];
export const PRIORITIES: Priority[] = ['Low', 'Normal', 'High', 'Urgent'];
export const EQUIPMENT_ITEMS = ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Docking station', 'Webcam'];
export const SOFTWARE = ['Adobe Acrobat Pro', 'Figma', 'JetBrains IntelliJ IDEA', 'Microsoft Visio', 'Miro', 'Tableau'];
export const SYSTEMS = ['Customer CRM', 'Finance reporting', 'HR records', 'Production database', 'Source code repository'];
export const LICENSES = ['1 month', '6 months', '1 year'];
export const ACCESS_LEVELS = ['Read only', 'Read and write', 'Administrator'];

export interface Choice {
  value: string;
  label: string;
}

export const DELIVERY_METHODS: Choice[] = [
  { value: 'Desk', label: 'Deliver to my desk' },
  { value: 'Ship', label: 'Ship to an address' },
  { value: 'Pickup', label: 'Pick up at the IT desk' },
];

export const AUDIENCES: (Choice & { value: Audience })[] = [
  { value: 'Everyone', label: 'Everyone' },
  { value: 'Admins', label: 'Admins only' },
  { value: 'Standard users', label: 'Standard users only' },
];

export function labelFor(choices: Choice[], value: string): string {
  return choices.find((choice) => choice.value === value)?.label ?? value;
}
