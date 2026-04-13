# iléSure Admin Dashboard — API Documentation

**Base URL:** `https://api.iléSure.com/admin/v1`  
**Content-Type:** `application/json`  
**Authorization:** `Bearer <admin_token>`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Companies](#3-companies)
4. [Listings](#4-listings)
5. [Verifications](#5-verifications)
6. [Waitlist](#6-waitlist)
7. [Analytics](#7-analytics)
8. [Activity Feed](#8-activity-feed)
9. [Settings](#9-settings)
10. [Common Types](#10-common-types)

---

## 1. Authentication

### POST `/auth/login`

Admin login to access the dashboard.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Admin email address |
| `password` | `string` | Yes | Admin password |

**Response**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "adm_001",
      "name": "Super Admin",
      "email": "admin@iléSure.com",
      "role": "system_administrator",
      "avatar": "https://cdn.iléSure.com/avatars/adm_001.jpg",
      "permissions": ["all"]
    }
  },
  "message": "Login successful"
}
```

---

### POST `/auth/logout`

Invalidate the current admin session.

**Headers**

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer <admin_token>` |

**Response**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me`

Get current authenticated admin details.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "adm_001",
    "name": "Super Admin",
    "email": "admin@iléSure.com",
    "role": "system_administrator",
    "avatar": "https://cdn.iléSure.com/avatars/adm_001.jpg",
    "lastLogin": "2025-02-15T09:30:00Z",
    "permissions": ["all"]
  }
}
```

---

### POST `/auth/change-password`

Change the current admin's password.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | `string` | Yes | Current password |
| `newPassword` | `string` | Yes | New password (min 8 characters) |
| `confirmPassword` | `string` | Yes | Confirm new password |

**Response**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### PUT `/auth/profile`

Update admin profile information.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Full name |
| `avatar` | `string` (URL) | No | Avatar image URL |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "adm_001",
    "name": "Super Admin",
    "avatar": "https://cdn.iléSure.com/avatars/adm_001.jpg",
    "updatedAt": "2025-02-15T10:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

## 2. Users

### GET `/users`

Get all users with optional filters.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page (max 100) |
| `search` | `string` | - | Search by name or email |
| `role` | `string` | - | Filter by role: `tenant`, `agent`, `landlord`, `company_admin`, `sub_agent` |
| `status` | `string` | - | Filter by status: `active`, `suspended`, `pending` |
| `verificationStatus` | `string` | - | Filter by verification: `pending`, `verified`, `rejected`, `more_info` |
| `sortBy` | `string` | `joinDate` | Sort field: `name`, `email`, `joinDate`, `role` |
| `sortOrder` | `string` | `desc` | Sort order: `asc`, `desc` |

**Response**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "u1",
        "name": "Adaeze Okonkwo",
        "email": "adaeze@gmail.com",
        "phone": "08012345678",
        "role": "tenant",
        "status": "active",
        "verificationStatus": "verified",
        "joinDate": "2024-09-01",
        "avatar": "https://cdn.iléSure.com/avatars/u1.jpg",
        "university": "Lead City University",
        "listings": null,
        "bookings": 1
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 52,
      "itemsPerPage": 20
    },
    "summary": {
      "total": 52,
      "tenants": 35,
      "agents": 8,
      "landlords": 5,
      "companyAdmins": 4,
      "suspended": 2
    }
  }
}
```

---

### GET `/users/:id`

Get a specific user by ID.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "u1",
    "name": "Adaeze Okonkwo",
    "email": "adaeze@gmail.com",
    "phone": "08012345678",
    "role": "tenant",
    "status": "active",
    "verificationStatus": "verified",
    "joinDate": "2024-09-01",
    "avatar": "https://cdn.iléSure.com/avatars/u1.jpg",
    "university": "Lead City University",
    "bookings": 1,
    "recentActivity": [
      {
        "type": "booking",
        "description": "Booked Sunrise Hostel Room 4A",
        "timestamp": "2025-02-10T14:30:00Z"
      }
    ]
  }
}
```

---

### PUT `/users/:id/suspend`

Suspend a user account.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | No | Reason for suspension |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "u5",
    "name": "Ngozi Eze",
    "status": "suspended",
    "suspendedAt": "2025-02-15T10:30:00Z",
    "suspendedBy": "adm_001"
  },
  "message": "User suspended successfully"
}
```

---

### PUT `/users/:id/unsuspend`

Unsuspend a user account.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "u5",
    "name": "Ngozi Eze",
    "status": "active",
    "unsuspendedAt": "2025-02-15T11:00:00Z"
  },
  "message": "User unsuspended successfully"
}
```

---

### GET `/users/:id/listings`

Get all listings created by a specific user (agent/landlord).

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `status` | `string` | - | Filter by listing status |

**Response**

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "l1",
        "title": "Emeka Court Room B3",
        "status": "pending_approval",
        "annualRent": 280000,
        "submittedDate": "2025-02-01",
        "interestCount": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 4
    }
  }
}
```

---

## 3. Companies

### GET `/companies`

Get all registered companies.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `search` | `string` | - | Search by name or CAC number |
| `status` | `string` | - | Filter by status: `pending`, `verified`, `rejected`, `more_info` |
| `tier` | `string` | - | Filter by tier: `free`, `basic`, `premium`, `enterprise` |
| `sortBy` | `string` | `joinDate` | Sort field |
| `sortOrder` | `string` | `desc` | Sort order |

**Response**

```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "c1",
        "name": "PrimeShelt Realtors Ltd",
        "tradingName": "PrimeShelt",
        "cacNumber": "RC-1234567",
        "tin": "TIN-8901234",
        "status": "verified",
        "tier": "enterprise",
        "agentsCount": 8,
        "listingsCount": 42,
        "joinDate": "2024-01-10",
        "director": "Kola Martins",
        "email": "info@primeshelt.com",
        "phone": "08011234000",
        "officeAddress": "14 Ring Road, Ibadan"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 4
    },
    "summary": {
      "total": 4,
      "verified": 2,
      "pending": 1,
      "rejected": 1,
      "totalAgents": 15
    }
  }
}
```

---

### GET `/companies/:id`

Get a specific company by ID.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c1",
    "name": "PrimeShelt Realtors Ltd",
    "tradingName": "PrimeShelt",
    "cacNumber": "RC-1234567",
    "tin": "TIN-8901234",
    "status": "verified",
    "tier": "enterprise",
    "agentsCount": 8,
    "listingsCount": 42,
    "joinDate": "2024-01-10",
    "director": "Kola Martins",
    "email": "info@primeshelt.com",
    "phone": "08011234000",
    "officeAddress": "14 Ring Road, Ibadan",
    "verifiedAt": "2024-01-15T14:00:00Z",
    "agents": [
      {
        "id": "a1",
        "name": "Agent One",
        "email": "agent1@primeshelt.com",
        "status": "active"
      }
    ]
  }
}
```

---

### POST `/companies`

Create a new company (admin action).

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Registered company name |
| `tradingName` | `string` | No | Trading as name |
| `cacNumber` | `string` | Yes | CAC registration number |
| `tin` | `string` | Yes | Tax Identification Number |
| `director` | `string` | Yes | Director's full name |
| `email` | `string` | Yes | Company email |
| `phone` | `string` | Yes | Company phone number |
| `officeAddress` | `string` | Yes | Office address |
| `tier` | `string` | No | Subscription tier (default: `free`) |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c5",
    "name": "New Company Ltd",
    "cacNumber": "RC-9999999",
    "status": "pending",
    "joinDate": "2025-02-15",
    "createdAt": "2025-02-15T12:00:00Z"
  },
  "message": "Company created successfully"
}
```

---

### PUT `/companies/:id`

Update company information.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Company name |
| `tradingName` | `string` | No | Trading as name |
| `director` | `string` | No | Director's name |
| `email` | `string` | No | Company email |
| `phone` | `string` | No | Phone number |
| `officeAddress` | `string` | No | Office address |
| `tier` | `string` | No | Subscription tier |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c1",
    "updatedAt": "2025-02-15T12:30:00Z"
  },
  "message": "Company updated successfully"
}
```

---

### PUT `/companies/:id/approve`

Approve a company (after verification).

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c1",
    "status": "verified",
    "verifiedAt": "2025-02-15T13:00:00Z"
  },
  "message": "Company approved successfully"
}
```

---

### PUT `/companies/:id/reject`

Reject a company application.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | Yes | Reason for rejection |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c1",
    "status": "rejected",
    "rejectedAt": "2025-02-15T13:00:00Z",
    "rejectionReason": "Invalid CAC documents"
  },
  "message": "Company rejected"
}
```

---

### PUT `/companies/:id/suspend`

Suspend a company account.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | No | Reason for suspension |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "c1",
    "status": "suspended",
    "suspendedAt": "2025-02-15T13:30:00Z"
  },
  "message": "Company suspended successfully"
}
```

---

### GET `/companies/:id/agents`

Get all agents under a company.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |

**Response**

```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "a1",
        "name": "Agent One",
        "email": "agent1@primeshelt.com",
        "phone": "08011111111",
        "status": "active",
        "verificationStatus": "verified",
        "listingsCount": 5,
        "joinDate": "2024-06-01"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 8
    }
  }
}
```

---

### POST `/companies/:id/invite-agent`

Invite a new agent to join the company.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Agent's email address |
| `name` | `string` | Yes | Agent's full name |
| `phone` | `string` | Yes | Agent's phone number |

**Response**

```json
{
  "success": true,
  "data": {
    "invitationId": "inv_001",
    "agentEmail": "newagent@primeshelt.com",
    "status": "pending",
    "expiresAt": "2025-02-22T12:00:00Z"
  },
  "message": "Invitation sent successfully"
}
```

---

## 4. Listings

### GET `/listings`

Get all property listings.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `search` | `string` | - | Search by title, agent name, or area |
| `status` | `string` | - | Filter by status |
| `propertyType` | `string` | - | Filter by property type |
| `city` | `string` | - | Filter by city |
| `areaCluster` | `string` | - | Filter by area cluster |
| `tier` | `string` | - | Filter by subscription tier |
| `minRent` | `number` | - | Minimum annual rent |
| `maxRent` | `number` | - | Maximum annual rent |
| `agentId` | `string` | - | Filter by agent ID |
| `companyId` | `string` | - | Filter by company ID |
| `sortBy` | `string` | `submittedDate` | Sort field |
| `sortOrder` | `string` | `desc` | Sort order |

**Response**

```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "l1",
        "title": "Emeka Court Room B3",
        "propertyType": "self_con",
        "agentName": "Tunde Fashola",
        "agentId": "u6",
        "isCompany": false,
        "companyName": null,
        "address": "12 Oba Otudeko Avenue",
        "areaCluster": "Toll Gate",
        "city": "Ibadan",
        "landmark": "Beside LCU Gate 2",
        "annualRent": 280000,
        "cautionFee": 50000,
        "agencyFee": 30000,
        "totalMoveinCost": 360000,
        "status": "pending_approval",
        "canBeShared": false,
        "genderRestriction": "any",
        "furnishing": "semi_furnished",
        "powerSource": "PHCN + Generator",
        "waterSource": "Borehole",
        "hasWifi": true,
        "securityType": "24hr Security Guard",
        "distanceFromLCU": "5 mins walk",
        "submittedDate": "2025-02-01",
        "approvedDate": null,
        "images": [
          "https://cdn.iléSure.com/listings/l1/img1.jpg",
          "https://cdn.iléSure.com/listings/l1/img2.jpg"
        ],
        "interestCount": 0,
        "tier": "basic"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87,
      "itemsPerPage": 20
    },
    "summary": {
      "total": 87,
      "pending_approval": 8,
      "active": 65,
      "needs_roommate": 5,
      "fully_booked": 6,
      "archived": 2,
      "rejected": 1
    }
  }
}
```

**Property Types**

| Value | Description |
|-------|-------------|
| `self_con` | Self-contain |
| `1_bed` | 1-Bedroom Flat |
| `2_bed` | 2-Bedroom Flat |
| `3_bed` | 3-Bedroom Flat |
| `mini_flat` | Mini Flat |
| `hostel_room` | Hostel Room |
| `shared_apartment` | Shared Apartment |
| `shortlet` | Shortlet |

**Listing Statuses**

| Value | Description |
|-------|-------------|
| `pending_approval` | Awaiting admin review |
| `active` | Live on platform |
| `needs_roommate` | Actively seeking roommate |
| `fully_booked` | All rooms taken |
| `archived` | Removed from platform |
| `rejected` | Rejected by admin |

---

### GET `/listings/:id`

Get a specific listing by ID.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "title": "Emeka Court Room B3",
    "propertyType": "self_con",
    "agentName": "Tunde Fashola",
    "agentId": "u6",
    "isCompany": false,
    "companyName": null,
    "address": "12 Oba Otudeko Avenue",
    "areaCluster": "Toll Gate",
    "city": "Ibadan",
    "landmark": "Beside LCU Gate 2",
    "annualRent": 280000,
    "cautionFee": 50000,
    "agencyFee": 30000,
    "totalMoveinCost": 360000,
    "status": "pending_approval",
    "canBeShared": false,
    "genderRestriction": "any",
    "furnishing": "semi_furnished",
    "powerSource": "PHCN + Generator",
    "waterSource": "Borehole",
    "hasWifi": true,
    "securityType": "24hr Security Guard",
    "distanceFromLCU": "5 mins walk",
    "submittedDate": "2025-02-01",
    "approvedDate": null,
    "images": [
      "https://cdn.iléSure.com/listings/l1/img1.jpg"
    ],
    "interestCount": 0,
    "tier": "basic",
    "rooms": [
      {
        "id": "room_1",
        "name": "Room B3",
        "isAvailable": true,
        "price": 280000
      }
    ],
    "agent": {
      "id": "u6",
      "name": "Tunde Fashola",
      "email": "tunde.agent@gmail.com",
      "phone": "08067890123",
      "avatar": "https://cdn.iléSure.com/avatars/u6.jpg",
      "verificationStatus": "verified"
    }
  }
}
```

---

### PUT `/listings/:id/approve`

Approve a listing to go live.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `note` | `string` | No | Optional note to agent |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "status": "active",
    "approvedDate": "2025-02-15T14:00:00Z",
    "approvedBy": "adm_001"
  },
  "message": "Listing approved and now live"
}
```

---

### PUT `/listings/:id/reject`

Reject a listing.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | Yes | Reason for rejection |
| `adminNote` | `string` | No | Additional notes |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "status": "rejected",
    "rejectedAt": "2025-02-15T14:30:00Z",
    "rejectedBy": "adm_001",
    "rejectionReason": "Incomplete property information"
  },
  "message": "Listing rejected"
}
```

---

### PUT `/listings/:id/request-changes`

Request changes from the agent.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `changes` | `string` | Yes | Description of required changes |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "status": "pending_approval",
    "changeRequestSentAt": "2025-02-15T15:00:00Z",
    "changeRequest": "Please update the contact information and add more photos"
  },
  "message": "Change request sent to agent"
}
```

---

### PUT `/listings/:id/archive`

Archive a listing.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "status": "archived",
    "archivedAt": "2025-02-15T15:30:00Z"
  },
  "message": "Listing archived"
}
```

---

### PUT `/listings/:id/status`

Update listing status directly.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes | New status |
| `reason` | `string` | No | Reason for status change |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "l1",
    "status": "needs_roommate",
    "updatedAt": "2025-02-15T16:00:00Z"
  },
  "message": "Listing status updated"
}
```

---

## 5. Verifications

### GET `/verifications`

Get all verification requests.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `role` | `string` | - | Filter by role: `agent`, `landlord`, `company` |
| `status` | `string` | - | Filter by status: `pending`, `verified`, `rejected`, `more_info` |
| `sortBy` | `string` | `submittedDate` | Sort field |
| `sortOrder` | `string` | `desc` | Sort order |

**Response**

```json
{
  "success": true,
  "data": {
    "verifications": [
      {
        "id": "v1",
        "applicantName": "Chinwe Obi",
        "applicantEmail": "chinwe.agent@gmail.com",
        "applicantPhone": "08089012345",
        "role": "agent",
        "companyName": null,
        "submittedDate": "2025-02-10",
        "status": "pending",
        "documents": {
          "nin": { "url": "https://cdn.iléSure.com/docs/v1/nin.jpg", "verified": false },
          "bvn": { "verified": false },
          "ownershipCert": { "url": "https://cdn.iléSure.com/docs/v1/cert.jpg", "verified": false },
          "utilityBill": { "url": "https://cdn.iléSure.com/docs/v1/bill.jpg", "verified": false },
          "selfie": { "url": "https://cdn.iléSure.com/docs/v1/selfie.jpg", "verified": false }
        },
        "checklist": {
          "ninVerified": false,
          "bvnConfirmed": false,
          "ownershipReviewed": false,
          "utilityBillChecked": false,
          "selfieMatches": false,
          "otpVerified": true
        },
        "adminNotes": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 3
    }
  }
}
```

---

### GET `/verifications/:id`

Get a specific verification request by ID.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "applicantName": "Chinwe Obi",
    "applicantEmail": "chinwe.agent@gmail.com",
    "applicantPhone": "08089012345",
    "role": "agent",
    "companyName": null,
    "submittedDate": "2025-02-10",
    "status": "pending",
    "documents": {
      "nin": { "url": "https://cdn.iléSure.com/docs/v1/nin.jpg", "verified": false },
      "bvn": { "verified": false },
      "ownershipCert": { "url": "https://cdn.iléSure.com/docs/v1/cert.jpg", "verified": false },
      "utilityBill": { "url": "https://cdn.iléSure.com/docs/v1/bill.jpg", "verified": false },
      "selfie": { "url": "https://cdn.iléSure.com/docs/v1/selfie.jpg", "verified": false }
    },
    "checklist": {
      "ninVerified": false,
      "bvnConfirmed": false,
      "ownershipReviewed": false,
      "utilityBillChecked": false,
      "selfieMatches": false,
      "otpVerified": true
    },
    "adminNotes": null,
    "reviewedBy": null,
    "reviewedAt": null
  }
}
```

---

### PUT `/verifications/:id/checklist`

Update verification checklist items.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `checklist` | `object` | Yes | Checklist item updates |

**Request Example**

```json
{
  "checklist": {
    "ninVerified": true,
    "bvnConfirmed": true,
    "ownershipReviewed": false,
    "utilityBillChecked": false,
    "selfieMatches": true,
    "otpVerified": true
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "checklist": {
      "ninVerified": true,
      "bvnConfirmed": true,
      "ownershipReviewed": false,
      "utilityBillChecked": false,
      "selfieMatches": true,
      "otpVerified": true
    },
    "updatedAt": "2025-02-15T14:30:00Z"
  },
  "message": "Checklist updated"
}
```

---

### PUT `/verifications/:id/notes`

Add or update admin notes for a verification.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | `string` | Yes | Admin notes |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "adminNotes": "Ownership certificate appears blurry. Please request a clearer scan.",
    "updatedAt": "2025-02-15T14:45:00Z"
  },
  "message": "Notes updated"
}
```

---

### PUT `/verifications/:id/approve`

Approve a verification request.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `note` | `string` | No | Optional note to applicant |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "status": "verified",
    "verifiedAt": "2025-02-15T15:00:00Z",
    "verifiedBy": "adm_001",
    "applicant": {
      "id": "u8",
      "name": "Chinwe Obi",
      "email": "chinwe.agent@gmail.com"
    }
  },
  "message": "Verification approved. Applicant is now verified."
}
```

---

### PUT `/verifications/:id/reject`

Reject a verification request.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | `string` | Yes | Reason for rejection |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "status": "rejected",
    "rejectedAt": "2025-02-15T15:30:00Z",
    "rejectedBy": "adm_001",
    "rejectionReason": "Unable to verify identity documents"
  },
  "message": "Verification rejected"
}
```

---

### PUT `/verifications/:id/request-info`

Request more information from the applicant.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | Yes | Information request message |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "v1",
    "status": "more_info",
    "infoRequestedAt": "2025-02-15T16:00:00Z",
    "infoRequestMessage": "Please provide a clearer copy of your ownership certificate."
  },
  "message": "Information request sent to applicant"
}
```

---

## 6. Waitlist

### GET `/waitlist`

Get all waitlist entries.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `search` | `string` | - | Search by name, email, university |
| `status` | `string` | - | Filter by status: `waiting`, `notified`, `matched` |
| `university` | `string` | - | Filter by university |
| `corridor` | `string` | - | Filter by preferred corridor |
| `minBudget` | `number` | - | Minimum budget |
| `maxBudget` | `number` | - | Maximum budget |
| `needsRoommate` | `boolean` | - | Filter by roommate preference |
| `sortBy` | `string` | `joinedDate` | Sort field |
| `sortOrder` | `string` | `desc` | Sort order |

**Response**

```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "w1",
        "name": "Adaeze Okonkwo",
        "email": "adaeze@gmail.com",
        "phone": "08012345678",
        "university": "Lead City University",
        "budgetMin": 200000,
        "budgetMax": 350000,
        "preferredCorridors": ["Toll Gate", "Bodija"],
        "moveInDate": "2025-03-01",
        "needsRoommate": true,
        "genderPreference": "female",
        "contactChannel": "whatsapp",
        "status": "waiting",
        "joinedDate": "2025-01-10"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 6
    },
    "summary": {
      "total": 6,
      "waiting": 4,
      "notified": 1,
      "matched": 1,
      "needsRoommate": 4,
      "avgBudgetMin": 216666,
      "topCorridor": "Toll Gate"
    }
  }
}
```

---

### GET `/waitlist/:id`

Get a specific waitlist entry.

**Response**

```json
{
  "success": true,
  "data": {
    "id": "w1",
    "name": "Adaeze Okonkwo",
    "email": "adaeze@gmail.com",
    "phone": "08012345678",
    "university": "Lead City University",
    "budgetMin": 200000,
    "budgetMax": 350000,
    "preferredCorridors": ["Toll Gate", "Bodija"],
    "moveInDate": "2025-03-01",
    "needsRoommate": true,
    "genderPreference": "female",
    "contactChannel": "whatsapp",
    "status": "waiting",
    "joinedDate": "2025-01-10",
    "matchedListings": [
      {
        "id": "l1",
        "title": "Emeka Court Room B3",
        "annualRent": 280000,
        "areaCluster": "Toll Gate"
      }
    ]
  }
}
```

---

### PUT `/waitlist/:id/status`

Update waitlist entry status.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | `string` | Yes | New status: `waiting`, `notified`, `matched` |

**Response**

```json
{
  "success": true,
  "data": {
    "id": "w1",
    "status": "notified",
    "updatedAt": "2025-02-15T14:00:00Z"
  },
  "message": "Status updated"
}
```

---

### DELETE `/waitlist/:id`

Remove a waitlist entry.

**Response**

```json
{
  "success": true,
  "message": "Waitlist entry removed"
}
```

---

### GET `/waitlist/export`

Export waitlist data as CSV.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | `string` | - | Filter by status |
| `university` | `string` | - | Filter by university |

**Response**

Returns a CSV file download with headers:
`id,name,email,phone,university,budgetMin,budgetMax,preferredCorridors,moveInDate,needsRoommate,genderPreference,contactChannel,status,joinedDate`

---

### GET `/waitlist/analytics`

Get waitlist analytics data.

**Response**

```json
{
  "success": true,
  "data": {
    "totalEntries": 234,
    "byStatus": {
      "waiting": 180,
      "notified": 40,
      "matched": 14
    },
    "byUniversity": [
      { "university": "Lead City University", "count": 142 },
      { "university": "University of Ibadan", "count": 92 }
    ],
    "byCorridor": [
      { "corridor": "Toll Gate", "demand": 142 },
      { "corridor": "Bodija", "demand": 98 },
      { "corridor": "Sango", "demand": 76 }
    ],
    "budgetDistribution": [
      { "range": "< ₦200k", "count": 45 },
      { "range": "₦200–350k", "count": 120 },
      { "range": "₦350–500k", "count": 55 },
      { "range": "> ₦500k", "count": 14 }
    ],
    "contactPreferences": {
      "whatsapp": 65,
      "email": 25,
      "call": 10
    },
    "trend": [
      { "month": "Aug", "entries": 12 },
      { "month": "Sep", "entries": 28 },
      { "month": "Oct", "entries": 45 }
    ]
  }
}
```

---

## 7. Analytics

### GET `/analytics/dashboard`

Get dashboard overview data.

**Response**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalListings": 87,
      "activeUsers": 3890,
      "pendingApprovals": 11,
      "totalRevenue": 1575000
    },
    "recentListings": [
      {
        "id": "l1",
        "title": "Emeka Court Room B3",
        "areaCluster": "Toll Gate",
        "agentName": "Tunde Fashola",
        "annualRent": 280000,
        "status": "pending_approval"
      }
    ],
    "recentActivity": [
      {
        "id": "a1",
        "type": "verification",
        "title": "New Agent Verification",
        "description": "Chinwe Obi submitted verification documents",
        "timestamp": "2025-02-15T14:00:00Z"
      }
    ],
    "quickStats": {
      "waitlistSize": 234,
      "newUsersThisWeek": 48,
      "bookingsThisMonth": 31,
      "activeCompanies": 12
    }
  }
}
```

---

### GET `/analytics/waitlist`

Get waitlist trend and analytics.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | `string` | `1y` | Date range: `3m`, `6m`, `1y` |

**Response**

```json
{
  "success": true,
  "data": {
    "trend": [
      { "month": "Aug", "entries": 12 },
      { "month": "Sep", "entries": 28 },
      { "month": "Oct", "entries": 45 }
    ],
    "corridorDemand": [
      { "corridor": "Toll Gate", "demand": 142 },
      { "corridor": "Bodija", "demand": 98 }
    ]
  }
}
```

---

### GET `/analytics/revenue`

Get revenue analytics.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | `string` | `1y` | Date range: `3m`, `6m`, `1y` |

**Response**

```json
{
  "success": true,
  "data": {
    "revenue": [
      { "month": "Sep", "subscription": 45000, "transaction": 28000 },
      { "month": "Oct", "subscription": 78000, "transaction": 52000 }
    ],
    "totalSubscription": 860000,
    "totalTransaction": 620000,
    "totalRevenue": 1480000
  }
}
```

---

### GET `/analytics/listings`

Get listing analytics.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | `string` | `1y` | Date range: `3m`, `6m`, `1y` |

**Response**

```json
{
  "success": true,
  "data": {
    "priceDistribution": [
      { "range": "₦100–200k", "count": 38 },
      { "range": "₦200–300k", "count": 62 },
      { "range": "₦300–450k", "count": 89 }
    ],
    "byStatus": {
      "pending_approval": 8,
      "active": 65,
      "needs_roommate": 5,
      "fully_booked": 6,
      "archived": 2,
      "rejected": 1
    },
    "byPropertyType": [
      { "type": "self_con", "count": 35 },
      { "type": "1_bed", "count": 28 }
    ]
  }
}
```

---

### GET `/analytics/bookings`

Get booking analytics.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | `string` | `1y` | Date range: `3m`, `6m`, `1y` |

**Response**

```json
{
  "success": true,
  "data": {
    "trend": [
      { "month": "Sep", "bookings": 5 },
      { "month": "Oct", "bookings": 12 }
    ],
    "totalBookings": 126,
    "avgMonthlyBookings": 16
  }
}
```

---

### GET `/analytics/users`

Get user analytics.

**Response**

```json
{
  "success": true,
  "data": {
    "byRole": {
      "tenant": 3500,
      "agent": 280,
      "landlord": 80,
      "company_admin": 20,
      "sub_agent": 10
    },
    "byStatus": {
      "active": 3750,
      "suspended": 80,
      "pending": 60
    },
    "newUsersTrend": [
      { "month": "Sep", "count": 120 },
      { "month": "Oct", "count": 185 }
    ]
  }
}
```

---

### GET `/analytics/tiers`

Get subscription tier distribution.

**Response**

```json
{
  "success": true,
  "data": {
    "tierDistribution": [
      { "name": "Free", "value": 67, "color": "#A07860" },
      { "name": "Basic", "value": 21, "color": "#D4821A" },
      { "name": "Premium", "value": 8, "color": "#8B4513" },
      { "name": "Enterprise", "value": 4, "color": "#F5A623" }
    ],
    "revenueByTier": {
      "free": 0,
      "basic": 280000,
      "premium": 450000,
      "enterprise": 850000
    }
  }
}
```

---

## 8. Activity Feed

### GET `/activity`

Get recent platform activity.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `type` | `string` | - | Filter by type: `listing`, `verification`, `booking`, `user`, `waitlist` |

**Response**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "a1",
        "type": "verification",
        "title": "New Agent Verification",
        "description": "Chinwe Obi submitted verification documents",
        "timestamp": "2025-02-15T14:00:00Z",
        "metadata": {
          "applicantId": "u8",
          "applicantRole": "agent"
        }
      },
      {
        "id": "a2",
        "type": "listing",
        "title": "New Listing Submitted",
        "description": "Emeka Court Room B3 — Toll Gate, Ibadan",
        "timestamp": "2025-02-15T13:42:00Z",
        "metadata": {
          "listingId": "l1",
          "agentId": "u6"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 7
    }
  }
}
```

---

## 9. Settings

### GET `/settings`

Get all platform settings.

**Response**

```json
{
  "success": true,
  "data": {
    "notifications": {
      "newListings": true,
      "verificationRequests": true,
      "newUserRegistrations": false,
      "criticalAlerts": true
    },
    "platform": {
      "maintenanceMode": false,
      "registrationEnabled": true,
      "waitlistEnabled": true
    },
    "limits": {
      "maxImagesPerListing": 10,
      "maxListingsPerAgent": 50,
      "waitlistMaxBudget": 2000000
    }
  }
}
```

---

### PUT `/settings/notifications`

Update notification preferences for admin.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `newListings` | `boolean` | No | Email on new listings |
| `verificationRequests` | `boolean` | No | Email on verification requests |
| `newUserRegistrations` | `boolean` | No | Email on new user registrations |
| `criticalAlerts` | `boolean` | No | Email on critical alerts |

**Response**

```json
{
  "success": true,
  "data": {
    "notifications": {
      "newListings": true,
      "verificationRequests": true,
      "newUserRegistrations": false,
      "criticalAlerts": true
    },
    "updatedAt": "2025-02-15T14:00:00Z"
  },
  "message": "Notification settings updated"
}
```

---

## 10. Common Types

### User Roles

| Value | Description |
|-------|-------------|
| `tenant` | Student looking for accommodation |
| `agent` | Individual property agent |
| `landlord` | Property owner |
| `company_admin` | Admin of a real estate company |
| `sub_agent` | Agent under a company |

### User Status

| Value | Description |
|-------|-------------|
| `active` | Active account |
| `suspended` | Suspended account |
| `pending` | Pending activation |

### Verification Status

| Value | Description |
|-------|-------------|
| `pending` | Awaiting review |
| `verified` | Successfully verified |
| `rejected` | Verification rejected |
| `more_info` | Additional information requested |

### Tier Names

| Value | Description |
|-------|-------------|
| `free` | Free tier |
| `basic` | Basic paid tier |
| `premium` | Premium tier |
| `enterprise` | Enterprise tier |

### Gender Restrictions

| Value | Description |
|-------|-------------|
| `any` | Any gender |
| `male_only` | Males only |
| `female_only` | Females only |
| `mixed` | Mixed gender |

### Furnishing Types

| Value | Description |
|-------|-------------|
| `fully_furnished` | Fully furnished |
| `semi_furnished` | Semi-furnished |
| `unfurnished` | Not furnished |

### Waitlist Status

| Value | Description |
|-------|-------------|
| `waiting` | Waiting for match |
| `notified` | Notified of matches |
| `matched` | Successfully matched |

### Contact Channels

| Value | Description |
|-------|-------------|
| `whatsapp` | WhatsApp |
| `email` | Email |
| `call` | Phone call |

### Gender Preferences

| Value | Description |
|-------|-------------|
| `any` | Any gender |
| `male` | Male preferred |
| `female` | Female preferred |

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing auth token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination

All list endpoints support pagination with the following query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page (max 100) |

Pagination metadata is included in all list responses:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Rate Limiting

| Endpoint Group | Limit |
|----------------|-------|
| Authentication | 5 requests / minute |
| Read operations | 100 requests / minute |
| Write operations | 30 requests / minute |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708003200
```

---

## Webhooks

For real-time notifications, configure webhooks at `POST /webhooks`:

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | Webhook endpoint URL |
| `events` | `string[]` | Yes | Events to subscribe to |
| `secret` | `string` | Yes | Webhook secret for verification |

**Available Events**

| Event | Description |
|-------|-------------|
| `listing.created` | New listing submitted |
| `listing.approved` | Listing approved |
| `listing.rejected` | Listing rejected |
| `verification.submitted` | New verification request |
| `verification.approved` | Verification approved |
| `verification.rejected` | Verification rejected |
| `user.registered` | New user registered |
| `company.registered` | New company registered |

---

*Document Version: 1.0*  
*Last Updated: February 15, 2025*
