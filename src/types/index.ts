// ── iléSure Admin, TypeScript Types ──────────────────────────────

// Shared vocabulary comes from the backend contract (src/contracts/generated.ts, never
// edited here). The interfaces below are admin-specific view shapes built on it.
import type {
  AccountStatus,
  AdminRole,
  CompanyStatus,
  Furnishing,
  GenderRestriction,
  ListingStatus,
  PropertyType,
  TierId,
  UserRole,
  VerificationStatus,
} from '../contracts/generated';

export type {
  AccountStatus,
  AdminRole,
  BookingStatus,
  CompanyStatus,
  ListingStatus,
  PropertyType,
  TierId,
  UserRole,
  VerificationStatus,
} from '../contracts/generated';
export type { ApiResponse, ErrorEnvelope, SuccessEnvelope } from '../contracts/generated';

/** @deprecated use TierId from the contract. */
export type TierName = TierId;
export type WaitlistStatus = 'waiting' | 'converted' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  verificationStatus: VerificationStatus;
  joinDate: string;
  avatar?: string;
  university?: string;
  listings?: number;
  bookings?: number;
}

export interface Company {
  id: string;
  name: string;
  tradingName?: string;
  cacNumber: string;
  tin: string;
  status: CompanyStatus;
  tier: TierId;
  agentsCount: number;
  listingsCount: number;
  joinDate: string;
  director: string;
  email: string;
  phone: string;
  officeAddress: string;
}

export interface Listing {
  id: string;
  title: string;
  propertyType: PropertyType;
  agentName: string;
  agentId: string;
  isCompany: boolean;
  companyName?: string;
  address: string;
  areaCluster: string;
  city: string;
  landmark?: string;
  annualRent: number;
  cautionFee: number;
  agencyFee: number;
  totalMoveinCost: number;
  status: ListingStatus;
  canBeShared: boolean;
  genderRestriction: GenderRestriction;
  furnishing: Furnishing;
  powerSource: string;
  waterSource: string;
  hasWifi: boolean;
  securityType: string;
  distanceFromLCU?: string;
  submittedDate: string;
  approvedDate?: string;
  images?: string[];
  interestCount: number;
  tier: TierId;
}

export interface VerificationRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  role: 'agent' | 'landlord' | 'company';
  companyName?: string;
  submittedDate: string;
  status: VerificationStatus;
  documents: {
    nin?: { url: string; verified: boolean };
    bvn?: { verified: boolean };
    ownershipCert?: { url: string; verified: boolean };
    utilityBill?: { url: string; verified: boolean };
    selfie?: { url: string; verified: boolean };
    cacCert?: { url: string; verified: boolean };
    cacForm?: { url: string; verified: boolean };
    tin?: { verified: boolean };
    directorNin?: { url: string; verified: boolean };
  };
  adminNotes?: string;
  checklist: {
    ninVerified: boolean;
    bvnConfirmed: boolean;
    ownershipReviewed: boolean;
    utilityBillChecked: boolean;
    selfieMatches: boolean;
    otpVerified: boolean;
    cacVerified?: boolean;
    cacFormVerified?: boolean;
    tinVerified?: boolean;
    directorNinVerified?: boolean;
  };
}

export interface WaitlistEntry {
  _id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  university?: string;
  budgetMin: number;
  budgetMax: number;
  preferredCorridor: string;
  distancePreference: string;
  moveInDate: string;
  roommateNeeded: boolean;
  contactPreference: 'whatsapp' | 'email' | 'sms';
  status: WaitlistStatus;
  createdAt: string;
  updatedAt?: string;
  convertedAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin?: string;
  permissions: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage?: number;
  };
}

export interface UsersListResponse {
  users: Array<{
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: UserRole;
    status: AccountStatus;
    verificationStatus: VerificationStatus;
    university?: string;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ListingsListResponse {
  listings: Array<{
    _id: string;
    title: string;
    propertyType: PropertyType;
    landlordId: { fullName: string; email: string };
    address: string;
    areaCluster: string;
    city: string;
    annualRent: number;
    status: ListingStatus;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface VerificationsListResponse {
  verifications: Array<{
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: 'agent' | 'landlord' | 'company_admin';
    verificationStatus: VerificationStatus;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface CompaniesListResponse {
  companies: Array<{
    _id: string;
    name: string;
    tradingName?: string;
    cacNumber: string;
    tin?: string;
    status: CompanyStatus;
    director?: string;
    email?: string;
    phone?: string;
    officeAddress?: string;
    createdAt: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage?: number;
  };
  summary?: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
  };
}

export interface WaitlistListResponse {
  entries: WaitlistEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  summary?: {
    total: number;
    waiting: number;
    converted: number;
    expired: number;
  };
}

export interface ActivityListResponse {
  activities: ActivityItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'listing' | 'verification' | 'booking' | 'user' | 'waitlist';
  title: string;
  description: string;
  timestamp: string;
}

export interface KpiMetric {
  label: string;
  value: string | number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface DashboardResponse {
  kpis: {
    totalListings: number;
    activeUsers: number;
    pendingApprovals: number;
    totalRevenue: number;
  };
  recentListings: Listing[];
  recentActivity: ActivityItem[];
  quickStats: {
    waitlistSize: number;
    newUsersThisWeek: number;
    bookingsThisMonth: number;
    activeCompanies: number;
  };
}

export interface SettingsResponse {
  notifications: {
    newListings: boolean;
    verificationRequests: boolean;
    newUserRegistrations: boolean;
    criticalAlerts: boolean;
  };
  platform: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    waitlistEnabled: boolean;
  };
  limits: {
    maxImagesPerListing: number;
    maxListingsPerAgent: number;
    waitlistMaxBudget: number;
  };
}
