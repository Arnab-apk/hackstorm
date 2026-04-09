import type { CredentialSchema } from '@/types';

// ===========================================
// PREDEFINED CREDENTIAL SCHEMAS
// ===========================================

export const CREDENTIAL_SCHEMAS: Record<string, CredentialSchema> = {
  'university-degree': {
    id: 'university-degree',
    name: 'University Degree',
    description: 'Academic degree credential issued by universities',
    version: '1.0.0',
    fields: [
      {
        key: 'name',
        label: 'Full Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'studentId',
        label: 'Student ID',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'degreeType',
        label: 'Degree Type',
        type: 'select',
        required: true,
        hideable: false,
        options: ['Bachelor', 'Master', 'Doctoral', 'Associate', 'Professional'],
      },
      {
        key: 'degreeName',
        label: 'Degree Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'major',
        label: 'Major',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'minor',
        label: 'Minor',
        type: 'string',
        required: false,
        hideable: true,
      },
      {
        key: 'gpa',
        label: 'GPA',
        type: 'number',
        required: false,
        hideable: true,
        validation: {
          min: 0,
          max: 4,
        },
      },
      {
        key: 'honors',
        label: 'Honors',
        type: 'select',
        required: false,
        hideable: true,
        options: ['None', 'Cum Laude', 'Magna Cum Laude', 'Summa Cum Laude'],
      },
      {
        key: 'graduationDate',
        label: 'Graduation Date',
        type: 'date',
        required: true,
        hideable: true,
      },
    ],
  },

  'employee-id': {
    id: 'employee-id',
    name: 'Employee ID',
    description: 'Employment credential issued by organizations',
    version: '1.0.0',
    fields: [
      {
        key: 'name',
        label: 'Employee Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'employeeId',
        label: 'Employee ID',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'department',
        label: 'Department',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'position',
        label: 'Position/Title',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'clearanceLevel',
        label: 'Clearance Level',
        type: 'number',
        required: false,
        hideable: true,
        validation: {
          min: 1,
          max: 5,
        },
      },
      {
        key: 'startDate',
        label: 'Employment Start Date',
        type: 'date',
        required: true,
        hideable: true,
      },
      {
        key: 'employmentType',
        label: 'Employment Type',
        type: 'select',
        required: true,
        hideable: true,
        options: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      },
    ],
  },

  'event-ticket': {
    id: 'event-ticket',
    name: 'Event Ticket',
    description: 'Event access credential',
    version: '1.0.0',
    fields: [
      {
        key: 'attendeeName',
        label: 'Attendee Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'eventName',
        label: 'Event Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'eventDate',
        label: 'Event Date',
        type: 'date',
        required: true,
        hideable: false,
      },
      {
        key: 'ticketType',
        label: 'Ticket Type',
        type: 'select',
        required: true,
        hideable: true,
        options: ['General', 'VIP', 'Premium', 'Student', 'Early Bird'],
      },
      {
        key: 'seatNumber',
        label: 'Seat Number',
        type: 'string',
        required: false,
        hideable: true,
      },
      {
        key: 'ticketId',
        label: 'Ticket ID',
        type: 'string',
        required: true,
        hideable: true,
      },
    ],
  },

  'professional-certification': {
    id: 'professional-certification',
    name: 'Professional Certification',
    description: 'Professional certification credential',
    version: '1.0.0',
    fields: [
      {
        key: 'name',
        label: 'Certificate Holder Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'certificationName',
        label: 'Certification Name',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'certificationId',
        label: 'Certification ID',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'issuingOrganization',
        label: 'Issuing Organization',
        type: 'string',
        required: true,
        hideable: false,
      },
      {
        key: 'issueDate',
        label: 'Issue Date',
        type: 'date',
        required: true,
        hideable: true,
      },
      {
        key: 'expirationDate',
        label: 'Expiration Date',
        type: 'date',
        required: false,
        hideable: true,
      },
      {
        key: 'score',
        label: 'Score',
        type: 'number',
        required: false,
        hideable: true,
        validation: {
          min: 0,
          max: 100,
        },
      },
    ],
  },

  'age-verification': {
    id: 'age-verification',
    name: 'Age Verification',
    description: 'Age verification credential for proving age requirements',
    version: '1.0.0',
    fields: [
      {
        key: 'name',
        label: 'Full Name',
        type: 'string',
        required: true,
        hideable: true,
      },
      {
        key: 'dateOfBirth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        hideable: true,
      },
      {
        key: 'ageAtIssuance',
        label: 'Age at Issuance',
        type: 'number',
        required: true,
        hideable: true,
        validation: {
          min: 0,
          max: 150,
        },
      },
      {
        key: 'isOver18',
        label: 'Is Over 18',
        type: 'boolean',
        required: true,
        hideable: false,
      },
      {
        key: 'isOver21',
        label: 'Is Over 21',
        type: 'boolean',
        required: true,
        hideable: false,
      },
    ],
  },
};

// ===========================================
// SCHEMA FUNCTIONS
// ===========================================

/**
 * Get schema by ID
 */
export function getSchema(schemaId: string): CredentialSchema | null {
  return CREDENTIAL_SCHEMAS[schemaId] || null;
}

/**
 * Get all available schemas
 */
export function getAllSchemas(): CredentialSchema[] {
  return Object.values(CREDENTIAL_SCHEMAS);
}

/**
 * Get hideable fields for a schema
 */
export function getHideableFields(schemaId: string): string[] {
  const schema = getSchema(schemaId);
  if (!schema) return [];
  return schema.fields.filter(f => f.hideable).map(f => f.key);
}

/**
 * Get non-hideable (always visible) fields for a schema
 */
export function getNonHideableFields(schemaId: string): string[] {
  const schema = getSchema(schemaId);
  if (!schema) return [];
  return schema.fields.filter(f => !f.hideable).map(f => f.key);
}

/**
 * Validate schema ID
 */
export function isValidSchemaId(schemaId: string): boolean {
  return schemaId in CREDENTIAL_SCHEMAS;
}
