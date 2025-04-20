// Theme constants used throughout the application
export const THEME_COLORS = {
  primary: {
    light: '#4CAF50',
    DEFAULT: '#2E7D32',
    dark: '#1B5E20',
  },
  secondary: {
    light: '#29B6F6',
    DEFAULT: '#0288D1',
    dark: '#01579B',
  },
  accent: {
    light: '#1DE9B6',
    DEFAULT: '#00BFA5',
    dark: '#00897B',
  },
  neutral: {
    lightest: '#F5F9F6',
    light: '#E0E0E0',
    medium: '#9E9E9E',
    dark: '#616161',
    darkest: '#333333',
  },
  status: {
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
  }
};

// Role-specific colors
export function getRoleColor(role: string | undefined): { color: string, bgLight: string } {
  switch (role) {
    case 'vendor':
      return { 
        color: THEME_COLORS.primary.DEFAULT, 
        bgLight: 'bg-green-100' 
      };
    case 'factory':
      return { 
        color: THEME_COLORS.secondary.DEFAULT, 
        bgLight: 'bg-blue-100' 
      };
    case 'entrepreneur':
      return { 
        color: THEME_COLORS.accent.DEFAULT, 
        bgLight: 'bg-teal-100' 
      };
    default:
      return { 
        color: THEME_COLORS.primary.DEFAULT, 
        bgLight: 'bg-green-100' 
      };
  }
}

// Language options for the application
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'mr', label: 'मराठी (Marathi)' },
  { value: 'bn', label: 'বাংলা (Bengali)' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
];

// Waste types available in the application
export const WASTE_TYPES = [
  { value: 'plastic_pet', label: 'Plastic (PET)' },
  { value: 'plastic_hdpe', label: 'Plastic (HDPE)' },
  { value: 'paper', label: 'Paper & Cardboard' },
  { value: 'glass', label: 'Glass' },
  { value: 'metal', label: 'Metal' },
  { value: 'ewaste', label: 'E-Waste' },
  { value: 'organic', label: 'Organic Waste' },
];

// Collection zones
export const COLLECTION_ZONES = [
  { value: 'zone_1', label: 'Zone 1 - North Market' },
  { value: 'zone_2', label: 'Zone 2 - Central District' },
  { value: 'zone_3', label: 'Zone 3 - South Residential' },
  { value: 'zone_4', label: 'Zone 4 - East Industrial' },
  { value: 'zone_5', label: 'Zone 5 - West Campus' },
];

// Transaction status
export const TRANSACTION_STATUS = {
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  processing: {
    label: 'Processing',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
};
