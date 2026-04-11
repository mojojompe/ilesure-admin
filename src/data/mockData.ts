import { User, Listing, Company, VerificationRequest, WaitlistEntry, ActivityItem } from '../types';

// ── MOCK USERS ─────────────────────────────────────────────────────
export const mockUsers: User[] = [
  { id: 'u1', name: 'Adaeze Okonkwo', email: 'adaeze@gmail.com', phone: '08012345678', role: 'tenant', status: 'active', verificationStatus: 'verified', joinDate: '2024-09-01', university: 'Lead City University', bookings: 1 },
  { id: 'u2', name: 'Emeka Chukwu', email: 'emeka@gmail.com', phone: '08023456789', role: 'tenant', status: 'active', verificationStatus: 'verified', joinDate: '2024-10-14', university: 'Lead City University', bookings: 0 },
  { id: 'u3', name: 'Fatima Bello', email: 'fatima@gmail.com', phone: '08034567890', role: 'tenant', status: 'pending', verificationStatus: 'pending', joinDate: '2025-01-05', university: 'University of Ibadan', bookings: 0 },
  { id: 'u4', name: 'Seun Adeyemi', email: 'seun@gmail.com', phone: '08045678901', role: 'tenant', status: 'active', verificationStatus: 'verified', joinDate: '2024-08-20', university: 'Lead City University', bookings: 2 },
  { id: 'u5', name: 'Ngozi Eze', email: 'ngozi@gmail.com', phone: '08056789012', role: 'tenant', status: 'suspended', verificationStatus: 'verified', joinDate: '2024-07-11', university: 'Lead City University', bookings: 1 },
  { id: 'u6', name: 'Tunde Fashola', email: 'tunde.agent@gmail.com', phone: '08067890123', role: 'agent', status: 'active', verificationStatus: 'verified', joinDate: '2024-06-15', listings: 4 },
  { id: 'u7', name: 'Alhaji Musa Ibrahim', email: 'musa.landlord@gmail.com', phone: '08078901234', role: 'landlord', status: 'active', verificationStatus: 'verified', joinDate: '2024-05-01', listings: 2 },
  { id: 'u8', name: 'Chinwe Obi', email: 'chinwe.agent@gmail.com', phone: '08089012345', role: 'agent', status: 'pending', verificationStatus: 'pending', joinDate: '2025-02-10', listings: 0 },
  { id: 'u9', name: 'Biodun Ogundimu', email: 'biodun.agent@gmail.com', phone: '08090123456', role: 'agent', status: 'active', verificationStatus: 'verified', joinDate: '2024-04-22', listings: 12 },
  { id: 'u10', name: 'Amina Suleiman', email: 'amina@gmail.com', phone: '08001234567', role: 'tenant', status: 'active', verificationStatus: 'verified', joinDate: '2024-11-30', university: 'Lead City University', bookings: 1 },
  { id: 'u11', name: 'Kola Martins', email: 'kola.company@gmail.com', phone: '08011234567', role: 'company_admin', status: 'active', verificationStatus: 'verified', joinDate: '2024-03-01', listings: 28 },
  { id: 'u12', name: 'Yemi Adesanya', email: 'yemi@gmail.com', phone: '08021234567', role: 'tenant', status: 'active', verificationStatus: 'verified', joinDate: '2025-01-15', university: 'Lead City University', bookings: 0 },
];

// ── MOCK COMPANIES ─────────────────────────────────────────────────
export const mockCompanies: Company[] = [
  { id: 'c1', name: 'PrimeShelt Realtors Ltd', tradingName: 'PrimeShelt', cacNumber: 'RC-1234567', tin: 'TIN-8901234', status: 'verified', tier: 'enterprise', agentsCount: 8, listingsCount: 42, joinDate: '2024-01-10', director: 'Kola Martins', email: 'info@primeshelt.com', phone: '08011234000', officeAddress: '14 Ring Road, Ibadan' },
  { id: 'c2', name: 'HomeBase Properties Ltd', tradingName: 'HomeBase', cacNumber: 'RC-2345678', tin: 'TIN-9012345', status: 'verified', tier: 'premium', agentsCount: 4, listingsCount: 18, joinDate: '2024-03-22', director: 'Funmi Adegoke', email: 'admin@homebase.ng', phone: '08022345000', officeAddress: '7 Bodija, Ibadan' },
  { id: 'c3', name: 'SwiftHomes Agency', tradingName: 'SwiftHomes', cacNumber: 'RC-3456789', tin: 'TIN-0123456', status: 'pending', tier: 'basic', agentsCount: 2, listingsCount: 6, joinDate: '2025-01-05', director: 'Samuel Adeleke', email: 'contact@swifthomes.ng', phone: '08033456000', officeAddress: '21 Toll Gate, Ibadan' },
  { id: 'c4', name: 'Campus Shelter Ltd', tradingName: 'CampusShelter', cacNumber: 'RC-4567890', tin: 'TIN-1234567', status: 'rejected', tier: 'free', agentsCount: 1, listingsCount: 3, joinDate: '2024-11-14', director: 'Chidi Nwosu', email: 'info@campusshelter.com', phone: '08044567000', officeAddress: '3 Agodi Road, Ibadan' },
];

// ── MOCK LISTINGS ──────────────────────────────────────────────────
export const mockListings: Listing[] = [
  { id: 'l1', title: 'Emeka Court Room B3', propertyType: 'self_con', agentName: 'Tunde Fashola', agentId: 'u6', isCompany: false, address: '12 Oba Otudeko Avenue', areaCluster: 'Toll Gate', city: 'Ibadan', landmark: 'Beside LCU Gate 2', annualRent: 280000, cautionFee: 50000, agencyFee: 30000, totalMoveinCost: 360000, status: 'pending_approval', canBeShared: false, genderRestriction: 'any', furnishing: 'semi_furnished', powerSource: 'PHCN + Generator', waterSource: 'Borehole', hasWifi: true, securityType: '24hr Security Guard', distanceFromLCU: '5 mins walk', submittedDate: '2025-02-01', interestCount: 0, tier: 'basic' },
  { id: 'l2', title: 'Sunrise Hostel Room 4A', propertyType: 'hostel_room', agentName: 'Biodun Ogundimu', agentId: 'u9', isCompany: false, address: '8 Sango Market Road', areaCluster: 'Sango', city: 'Ibadan', landmark: 'Near Sango Market', annualRent: 180000, cautionFee: 30000, agencyFee: 20000, totalMoveinCost: 230000, status: 'active', canBeShared: true, genderRestriction: 'female_only', furnishing: 'unfurnished', powerSource: 'PHCN + Solar', waterSource: 'Overhead Tank', hasWifi: false, securityType: 'Fence Only', distanceFromLCU: '15 mins', submittedDate: '2025-01-15', approvedDate: '2025-01-18', interestCount: 23, tier: 'free' },
  { id: 'l3', title: 'Modern 2-Bedroom Flat', propertyType: '2_bed', agentName: 'PrimeShelt Realtors Ltd', agentId: 'c1', isCompany: true, companyName: 'PrimeShelt Realtors Ltd', address: '5 Bodija Link Road', areaCluster: 'Bodija', city: 'Ibadan', landmark: 'Near Bodija Market', annualRent: 620000, cautionFee: 100000, agencyFee: 60000, totalMoveinCost: 780000, status: 'active', canBeShared: true, genderRestriction: 'any', furnishing: 'fully_furnished', powerSource: 'Full Hybrid', waterSource: 'Borehole', hasWifi: true, securityType: '24hr Security Guard', distanceFromLCU: '20 mins by bike', submittedDate: '2024-12-01', approvedDate: '2024-12-03', interestCount: 47, tier: 'enterprise' },
  { id: 'l4', title: 'Affordable Self-Contain', propertyType: 'self_con', agentName: 'Alhaji Musa Ibrahim', agentId: 'u7', isCompany: false, address: '3 Akobo Road', areaCluster: 'Akobo', city: 'Ibadan', landmark: 'Opposite Filling Station', annualRent: 200000, cautionFee: 40000, agencyFee: 25000, totalMoveinCost: 265000, status: 'needs_roommate', canBeShared: true, genderRestriction: 'male_only', furnishing: 'semi_furnished', powerSource: 'PHCN Only', waterSource: 'NWSC Supply', hasWifi: false, securityType: 'Burglary Proof Only', distanceFromLCU: '25 mins', submittedDate: '2024-11-20', approvedDate: '2024-11-22', interestCount: 12, tier: 'free' },
  { id: 'l5', title: 'Premium 1-Bedroom Flat', propertyType: '1_bed', agentName: 'HomeBase Properties Ltd', agentId: 'c2', isCompany: true, companyName: 'HomeBase Properties Ltd', address: '2 Agodi GRA', areaCluster: 'Agodi', city: 'Ibadan', landmark: 'Near Agodi Gardens', annualRent: 450000, cautionFee: 75000, agencyFee: 45000, totalMoveinCost: 570000, status: 'active', canBeShared: false, genderRestriction: 'any', furnishing: 'fully_furnished', powerSource: 'Full Hybrid', waterSource: 'Borehole', hasWifi: true, securityType: '24hr Security Guard', distanceFromLCU: '30 mins', submittedDate: '2025-01-08', approvedDate: '2025-01-10', interestCount: 31, tier: 'premium' },
  { id: 'l6', title: 'Student Mini-Flat', propertyType: 'mini_flat', agentName: 'Chinwe Obi', agentId: 'u8', isCompany: false, address: '17 Toll Gate Avenue', areaCluster: 'Toll Gate', city: 'Ibadan', landmark: 'Beside Unity Bank', annualRent: 320000, cautionFee: 55000, agencyFee: 35000, totalMoveinCost: 410000, status: 'pending_approval', canBeShared: false, genderRestriction: 'female_only', furnishing: 'unfurnished', powerSource: 'Generator Only', waterSource: 'Overhead Tank', hasWifi: false, securityType: 'Fence Only', distanceFromLCU: '8 mins walk', submittedDate: '2025-02-10', interestCount: 0, tier: 'free' },
  { id: 'l7', title: 'Cozy Shared Apartment', propertyType: 'shared_apartment', agentName: 'Biodun Ogundimu', agentId: 'u9', isCompany: false, address: '22 Oba Otudeko', areaCluster: 'Toll Gate', city: 'Ibadan', landmark: 'Behind Lead City', annualRent: 150000, cautionFee: 25000, agencyFee: 18000, totalMoveinCost: 193000, status: 'fully_booked', canBeShared: true, genderRestriction: 'any', furnishing: 'semi_furnished', powerSource: 'PHCN + Generator', waterSource: 'Borehole', hasWifi: true, securityType: 'Part-time Security', distanceFromLCU: '3 mins walk', submittedDate: '2024-10-01', approvedDate: '2024-10-05', interestCount: 64, tier: 'basic' },
  { id: 'l8', title: 'Elegant 3-Bedroom Flat', propertyType: '3_bed', agentName: 'PrimeShelt Realtors Ltd', agentId: 'c1', isCompany: true, companyName: 'PrimeShelt Realtors Ltd', address: '9 Ring Road Bypass', areaCluster: 'Ring Road', city: 'Ibadan', landmark: 'Near MRS Filling Station', annualRent: 900000, cautionFee: 150000, agencyFee: 90000, totalMoveinCost: 1140000, status: 'active', canBeShared: false, genderRestriction: 'any', furnishing: 'fully_furnished', powerSource: 'Full Hybrid', waterSource: 'Borehole', hasWifi: true, securityType: '24hr Security Guard', distanceFromLCU: '35 mins', submittedDate: '2024-09-15', approvedDate: '2024-09-17', interestCount: 18, tier: 'enterprise' },
];

// ── MOCK VERIFICATION QUEUE ────────────────────────────────────────
export const mockVerifications: VerificationRequest[] = [
  {
    id: 'v1', applicantName: 'Chinwe Obi', applicantEmail: 'chinwe.agent@gmail.com', applicantPhone: '08089012345',
    role: 'agent', submittedDate: '2025-02-10', status: 'pending',
    documents: { nin: { url: '/docs/nin_sample.jpg', verified: false }, bvn: { verified: false }, ownershipCert: { url: '/docs/cert_sample.jpg', verified: false }, utilityBill: { url: '/docs/bill_sample.jpg', verified: false }, selfie: { url: '/docs/selfie_sample.jpg', verified: false } },
    checklist: { ninVerified: false, bvnConfirmed: false, ownershipReviewed: false, utilityBillChecked: false, selfieMatches: false, otpVerified: true },
  },
  {
    id: 'v2', applicantName: 'SwiftHomes Agency', applicantEmail: 'contact@swifthomes.ng', applicantPhone: '08033456000',
    role: 'company', companyName: 'SwiftHomes Agency', submittedDate: '2025-01-05', status: 'pending',
    documents: { nin: { url: '/docs/nin_swift.jpg', verified: true }, bvn: { verified: true }, ownershipCert: { url: '/docs/cert_swift.jpg', verified: false }, utilityBill: { url: '/docs/bill_swift.jpg', verified: false }, selfie: { url: '/docs/selfie_swift.jpg', verified: true }, cacCert: { url: '/docs/cac_swift.jpg', verified: false }, cacForm: { url: '/docs/cacform_swift.jpg', verified: false }, tin: { verified: false }, directorNin: { url: '/docs/dirnin_swift.jpg', verified: true } },
    checklist: { ninVerified: true, bvnConfirmed: true, ownershipReviewed: false, utilityBillChecked: false, selfieMatches: true, otpVerified: true, cacVerified: false, cacFormVerified: false, tinVerified: false, directorNinVerified: true },
  },
  {
    id: 'v3', applicantName: 'Muyiwa Adeleke', applicantEmail: 'muyiwa.landlord@gmail.com', applicantPhone: '08034001122',
    role: 'landlord', submittedDate: '2025-02-14', status: 'more_info',
    documents: { nin: { url: '/docs/nin_muyiwa.jpg', verified: true }, bvn: { verified: true }, ownershipCert: { url: '/docs/cert_muyiwa.jpg', verified: false }, utilityBill: { url: '/docs/bill_muyiwa.jpg', verified: false }, selfie: { url: '/docs/selfie_muyiwa.jpg', verified: true } },
    checklist: { ninVerified: true, bvnConfirmed: true, ownershipReviewed: false, utilityBillChecked: false, selfieMatches: true, otpVerified: true },
    adminNotes: 'Ownership certificate appears blurry. Please re-upload a clearer scan.',
  },
];

// ── MOCK WAITLIST ──────────────────────────────────────────────────
export const mockWaitlist: WaitlistEntry[] = [
  { id: 'w1', name: 'Adaeze Okonkwo', email: 'adaeze@gmail.com', phone: '08012345678', university: 'Lead City University', budgetMin: 200000, budgetMax: 350000, preferredCorridors: ['Toll Gate', 'Bodija'], moveInDate: '2025-03-01', needsRoommate: true, genderPreference: 'female', contactChannel: 'whatsapp', status: 'waiting', joinedDate: '2025-01-10' },
  { id: 'w2', name: 'Emeka Chukwu', email: 'emeka@gmail.com', phone: '08023456789', university: 'Lead City University', budgetMin: 150000, budgetMax: 250000, preferredCorridors: ['Toll Gate'], moveInDate: '2025-02-01', needsRoommate: false, genderPreference: 'any', contactChannel: 'email', status: 'notified', joinedDate: '2024-12-15' },
  { id: 'w3', name: 'Fatima Bello', email: 'fatima@gmail.com', phone: '08034567890', university: 'University of Ibadan', budgetMin: 300000, budgetMax: 500000, preferredCorridors: ['Bodija', 'Agodi'], moveInDate: '2025-04-01', needsRoommate: true, genderPreference: 'female', contactChannel: 'whatsapp', status: 'waiting', joinedDate: '2025-01-20' },
  { id: 'w4', name: 'Seun Adeyemi', email: 'seun@gmail.com', phone: '08045678901', university: 'Lead City University', budgetMin: 180000, budgetMax: 300000, preferredCorridors: ['Toll Gate', 'Sango'], moveInDate: '2025-02-15', needsRoommate: true, genderPreference: 'male', contactChannel: 'call', status: 'matched', joinedDate: '2024-11-30' },
  { id: 'w5', name: 'Amina Suleiman', email: 'amina@gmail.com', phone: '08001234567', university: 'Lead City University', budgetMin: 250000, budgetMax: 400000, preferredCorridors: ['Bodija Annex', 'Toll Gate'], moveInDate: '2025-03-15', needsRoommate: false, genderPreference: 'female', contactChannel: 'whatsapp', status: 'waiting', joinedDate: '2025-02-01' },
  { id: 'w6', name: 'Yemi Adesanya', email: 'yemi@gmail.com', phone: '08021234567', university: 'Lead City University', budgetMin: 120000, budgetMax: 200000, preferredCorridors: ['Sango'], moveInDate: '2025-05-01', needsRoommate: true, genderPreference: 'any', contactChannel: 'whatsapp', status: 'waiting', joinedDate: '2025-02-10' },
];

// ── MOCK ACTIVITY FEED ─────────────────────────────────────────────
export const mockActivity: ActivityItem[] = [
  { id: 'a1', type: 'verification', title: 'New Agent Verification', description: 'Chinwe Obi submitted verification documents', timestamp: '2 mins ago' },
  { id: 'a2', type: 'listing', title: 'New Listing Submitted', description: 'Emeka Court Room B3 — Toll Gate, Ibadan', timestamp: '18 mins ago' },
  { id: 'a3', type: 'booking', title: 'Booking Confirmed', description: 'Adaeze Okonkwo booked Sunrise Hostel Room 4A', timestamp: '1 hr ago' },
  { id: 'a4', type: 'user', title: 'New User Registered', description: 'Yemi Adesanya joined as a Student', timestamp: '2 hrs ago' },
  { id: 'a5', type: 'waitlist', title: 'Waitlist Entry', description: 'Amina Suleiman joined waitlist for Toll Gate area', timestamp: '3 hrs ago' },
  { id: 'a6', type: 'listing', title: 'Listing Approved', description: 'Premium 1-Bedroom Flat by HomeBase Properties', timestamp: '5 hrs ago' },
  { id: 'a7', type: 'verification', title: 'Verification Approved', description: 'Biodun Ogundimu is now a Verified Agent', timestamp: '1 day ago' },
];

// ── CHART DATA ─────────────────────────────────────────────────────
export const waitlistTrendData = [
  { month: 'Aug', entries: 12 }, { month: 'Sep', entries: 28 }, { month: 'Oct', entries: 45 },
  { month: 'Nov', entries: 38 }, { month: 'Dec', entries: 22 }, { month: 'Jan', entries: 61 },
  { month: 'Feb', entries: 74 }, { month: 'Mar', entries: 89 }, { month: 'Apr', entries: 53 },
];

export const corridorDemandData = [
  { corridor: 'Toll Gate', demand: 142 }, { corridor: 'Bodija', demand: 98 },
  { corridor: 'Sango', demand: 76 }, { corridor: 'Agodi', demand: 54 },
  { corridor: 'Akobo', demand: 43 }, { corridor: 'Ring Road', demand: 31 },
  { corridor: 'Bodija Annex', demand: 28 },
];

export const priceDistributionData = [
  { range: '₦100–200k', count: 38 }, { range: '₦200–300k', count: 62 },
  { range: '₦300–450k', count: 89 }, { range: '₦450–600k', count: 44 },
  { range: '₦600–800k', count: 21 }, { range: '₦800k+', count: 9 },
];

export const bookingTrendData = [
  { month: 'Sep', bookings: 5 }, { month: 'Oct', bookings: 12 }, { month: 'Nov', bookings: 9 },
  { month: 'Dec', bookings: 7 }, { month: 'Jan', bookings: 18 }, { month: 'Feb', bookings: 24 },
  { month: 'Mar', bookings: 31 }, { month: 'Apr', bookings: 19 },
];

export const tierDistributionData = [
  { name: 'Free', value: 67, color: '#A07860' },
  { name: 'Basic', value: 21, color: '#D4821A' },
  { name: 'Premium', value: 8, color: '#8B4513' },
  { name: 'Enterprise', value: 4, color: '#F5A623' },
];

export const revenueData = [
  { month: 'Sep', subscription: 45000, transaction: 28000 }, { month: 'Oct', subscription: 78000, transaction: 52000 },
  { month: 'Nov', subscription: 65000, transaction: 41000 }, { month: 'Dec', subscription: 55000, transaction: 33000 },
  { month: 'Jan', subscription: 120000, transaction: 88000 }, { month: 'Feb', subscription: 145000, transaction: 112000 },
  { month: 'Mar', subscription: 190000, transaction: 147000 }, { month: 'Apr', subscription: 162000, transaction: 121000 },
];
