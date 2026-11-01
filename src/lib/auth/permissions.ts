export type PermissionKey =
  | 'articles:create'
  | 'articles:edit_own'
  | 'articles:edit_all'
  | 'articles:publish'
  | 'articles:delete'
  | 'breaking:manage'
  | 'categories:manage'
  | 'comments:moderate'
  | 'media:upload'
  | 'users:manage'
  | 'audit:view'
  | 'settings:manage'

export interface PermissionDefinition {
  key: PermissionKey
  group: 'Articles' | 'Breaking' | 'Categories' | 'Comments' | 'Media' | 'Administration'
  labelEn: string
  labelNe: string
  descriptionEn: string
  descriptionNe: string
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  {
    key: 'articles:create',
    group: 'Articles',
    labelEn: 'Create Articles',
    labelNe: 'समाचार लेख्ने',
    descriptionEn: 'Draft and submit new news articles.',
    descriptionNe: 'नयाँ समाचार मस्यौदा तयार गर्ने र पठाउने।',
  },
  {
    key: 'articles:edit_own',
    group: 'Articles',
    labelEn: 'Edit Own Articles',
    labelNe: 'आफ्नो समाचार सम्पादन',
    descriptionEn: 'Modify news articles created by oneself.',
    descriptionNe: 'आफूले लेखेका समाचार सम्पादन गर्ने।',
  },
  {
    key: 'articles:edit_all',
    group: 'Articles',
    labelEn: 'Edit All Articles',
    labelNe: 'सबै समाचार सम्पादन',
    descriptionEn: 'Edit articles written by any reporter or journalist.',
    descriptionNe: 'जुनसुकै संवाददाताले लेखेको समाचार सम्पादन गर्ने।',
  },
  {
    key: 'articles:publish',
    group: 'Articles',
    labelEn: 'Publish & Schedule Articles',
    labelNe: 'समाचार प्रकाशित र तालिका',
    descriptionEn: 'Directly publish articles live to the portal or schedule for later.',
    descriptionNe: 'समाचार प्रत्यक्ष प्रकाशित गर्ने वा भविष्यको लागि तालिका बनाउने।',
  },
  {
    key: 'articles:delete',
    group: 'Articles',
    labelEn: 'Delete Articles',
    labelNe: 'समाचार हटाउने',
    descriptionEn: 'Archive or permanently delete news articles.',
    descriptionNe: 'समाचार अर्काइभ गर्ने वा पूर्ण रूपमा हटाउने।',
  },
  {
    key: 'breaking:manage',
    group: 'Breaking',
    labelEn: 'Manage Breaking News',
    labelNe: 'ताजा अपडेट व्यवस्थापन',
    descriptionEn: 'Create, update, or dismiss the breaking news ticker alerts.',
    descriptionNe: 'मुख्य पृष्ठको ताजा अपडेट तथा ब्रेकिङ समाचार व्यवस्थापन गर्ने।',
  },
  {
    key: 'categories:manage',
    group: 'Categories',
    labelEn: 'Manage Categories & Tags',
    labelNe: 'विधा तथा ट्याग व्यवस्थापन',
    descriptionEn: 'Create, edit, reorder, or delete news categories and tags.',
    descriptionNe: 'समाचारका विधाहरू, उपविधाहरू र ट्यागहरू थप्ने तथा मिलाउने।',
  },
  {
    key: 'comments:moderate',
    group: 'Comments',
    labelEn: 'Moderate Comments',
    labelNe: 'प्रतिक्रिया व्यवस्थापन',
    descriptionEn: 'Approve, reject, or mark reader comments as spam.',
    descriptionNe: 'पाठकहरूका प्रतिक्रिया स्वीकृत, अस्वीकृत वा स्पाम गर्ने।',
  },
  {
    key: 'media:upload',
    group: 'Media',
    labelEn: 'Upload & Manage Media',
    labelNe: 'मिडिया तथा फोटो अपलोड',
    descriptionEn: 'Upload photos, videos, and manage the central media library.',
    descriptionNe: 'केन्द्रीय मिडिया लाइब्रेरीमा फोटो तथा सामग्री अपलोड गर्ने।',
  },
  {
    key: 'users:manage',
    group: 'Administration',
    labelEn: 'Manage Staff & Roles',
    labelNe: 'कर्मचारी तथा भूमिका व्यवस्थापन',
    descriptionEn: 'Create staff accounts, assign roles, and customize feature permissions.',
    descriptionNe: 'नयाँ कर्मचारी खाता बनाउने, भूमिका तोक्ने र सुविधाहरू दिने।',
  },
  {
    key: 'audit:view',
    group: 'Administration',
    labelEn: 'View Security Audit Logs',
    labelNe: 'सुरक्षा अडिट लग हेर्ने',
    descriptionEn: 'Inspect editorial changes, logins, and system activity logs.',
    descriptionNe: 'सम्पादकीय परिवर्तनहरू र प्रणाली लगहरू अनुगमन गर्ने।',
  },
  {
    key: 'settings:manage',
    group: 'Administration',
    labelEn: 'Manage Site Settings',
    labelNe: 'साइट सेटिङ्स व्यवस्थापन',
    descriptionEn: 'Configure footer details, social media handles, and live market tickers.',
    descriptionNe: 'फुटर विवरण, सामाजिक सञ्जाल र बजार दर तथा मौसम सेटिङ्स व्यवस्थापन गर्ने।',
  },
]

export const ROLE_DEFAULT_PERMISSIONS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: PERMISSION_DEFINITIONS.map((p) => p.key),
  ADMIN: [
    'articles:create',
    'articles:edit_own',
    'articles:edit_all',
    'articles:publish',
    'articles:delete',
    'breaking:manage',
    'categories:manage',
    'comments:moderate',
    'media:upload',
    'audit:view',
    'settings:manage',
  ],
  EDITOR: [
    'articles:create',
    'articles:edit_own',
    'articles:edit_all',
    'articles:publish',
    'breaking:manage',
    'comments:moderate',
    'media:upload',
  ],
  JOURNALIST: [
    'articles:create',
    'articles:edit_own',
    'media:upload',
  ],
  MODERATOR: [
    'comments:moderate',
  ],
  CUSTOM: [],
}

export function hasPermission(
  userRole: string,
  userPermissions: string[],
  requiredPermission: PermissionKey | PermissionKey[]
): boolean {
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
  return required.some((perm) => userPermissions.includes(perm))
}
