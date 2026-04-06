// Static demo data for admin dashboard (no auth required)

export const demoBuildings = [
  { id: '1', name: 'Sunrise Towers', address: '42 Marine Drive', city: 'Mumbai', num_floors: 10, num_flats: 20, created_at: '2025-06-15T10:00:00Z' },
  { id: '2', name: 'Green Valley Apartments', address: '15 MG Road', city: 'Bangalore', num_floors: 6, num_flats: 12, created_at: '2025-08-20T10:00:00Z' },
  { id: '3', name: 'Lake View Residency', address: '8 Lake Side', city: 'Hyderabad', num_floors: 8, num_flats: 16, created_at: '2025-10-01T10:00:00Z' },
  { id: '4', name: 'Palm Grove Heights', address: '22 Palm Road', city: 'Chennai', num_floors: 12, num_flats: 24, created_at: '2025-12-05T10:00:00Z' },
];

export const demoFlats = [
  { id: 'f1', flat_number: 'A-101', floor: 1, rent_amount: 15000, occupancy_status: 'occupied', building_id: '1', buildings: { name: 'Sunrise Towers' } },
  { id: 'f2', flat_number: 'A-102', floor: 1, rent_amount: 16000, occupancy_status: 'occupied', building_id: '1', buildings: { name: 'Sunrise Towers' } },
  { id: 'f3', flat_number: 'A-201', floor: 2, rent_amount: 17000, occupancy_status: 'occupied', building_id: '1', buildings: { name: 'Sunrise Towers' } },
  { id: 'f4', flat_number: 'A-202', floor: 2, rent_amount: 18000, occupancy_status: 'vacant', building_id: '1', buildings: { name: 'Sunrise Towers' } },
  { id: 'f5', flat_number: 'B-101', floor: 1, rent_amount: 12000, occupancy_status: 'occupied', building_id: '2', buildings: { name: 'Green Valley Apartments' } },
  { id: 'f6', flat_number: 'B-102', floor: 1, rent_amount: 13000, occupancy_status: 'occupied', building_id: '2', buildings: { name: 'Green Valley Apartments' } },
  { id: 'f7', flat_number: 'B-201', floor: 2, rent_amount: 14000, occupancy_status: 'vacant', building_id: '2', buildings: { name: 'Green Valley Apartments' } },
  { id: 'f8', flat_number: 'C-101', floor: 1, rent_amount: 20000, occupancy_status: 'occupied', building_id: '3', buildings: { name: 'Lake View Residency' } },
  { id: 'f9', flat_number: 'C-102', floor: 1, rent_amount: 22000, occupancy_status: 'occupied', building_id: '3', buildings: { name: 'Lake View Residency' } },
  { id: 'f10', flat_number: 'C-201', floor: 2, rent_amount: 21000, occupancy_status: 'vacant', building_id: '3', buildings: { name: 'Lake View Residency' } },
  { id: 'f11', flat_number: 'D-101', floor: 1, rent_amount: 25000, occupancy_status: 'occupied', building_id: '4', buildings: { name: 'Palm Grove Heights' } },
  { id: 'f12', flat_number: 'D-201', floor: 2, rent_amount: 28000, occupancy_status: 'vacant', building_id: '4', buildings: { name: 'Palm Grove Heights' } },
];

export const demoTenants = [
  { id: 't1', full_name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', id_proof: 'AADHAR-1234', lease_start: '2025-01-15', lease_end: '2026-01-14', rent_amount: 15000, flat_id: 'f1', created_at: '2025-01-10T10:00:00Z', flats: { flat_number: 'A-101', buildings: { name: 'Sunrise Towers' } } },
  { id: 't2', full_name: 'Priya Patel', phone: '9876543211', email: 'priya@email.com', id_proof: 'AADHAR-2345', lease_start: '2025-03-01', lease_end: '2026-02-28', rent_amount: 16000, flat_id: 'f2', created_at: '2025-02-25T10:00:00Z', flats: { flat_number: 'A-102', buildings: { name: 'Sunrise Towers' } } },
  { id: 't3', full_name: 'Amit Kumar', phone: '9876543212', email: 'amit@email.com', id_proof: 'PAN-ABCDE1234', lease_start: '2025-06-10', lease_end: '2026-06-09', rent_amount: 17000, flat_id: 'f3', created_at: '2025-06-05T10:00:00Z', flats: { flat_number: 'A-201', buildings: { name: 'Sunrise Towers' } } },
  { id: 't4', full_name: 'Sneha Reddy', phone: '9876543213', email: 'sneha@email.com', id_proof: 'AADHAR-3456', lease_start: '2025-09-01', lease_end: '2026-08-31', rent_amount: 12000, flat_id: 'f5', created_at: '2025-08-28T10:00:00Z', flats: { flat_number: 'B-101', buildings: { name: 'Green Valley Apartments' } } },
  { id: 't5', full_name: 'Vikram Singh', phone: '9876543214', email: 'vikram@email.com', id_proof: 'PAN-FGHIJ5678', lease_start: '2025-11-15', lease_end: '2026-11-14', rent_amount: 13000, flat_id: 'f6', created_at: '2025-11-10T10:00:00Z', flats: { flat_number: 'B-102', buildings: { name: 'Green Valley Apartments' } } },
  { id: 't6', full_name: 'Ananya Gupta', phone: '9876543215', email: 'ananya@email.com', id_proof: 'AADHAR-4567', lease_start: '2026-01-01', lease_end: '2026-12-31', rent_amount: 20000, flat_id: 'f8', created_at: '2025-12-28T10:00:00Z', flats: { flat_number: 'C-101', buildings: { name: 'Lake View Residency' } } },
  { id: 't7', full_name: 'Karan Mehta', phone: '9876543216', email: 'karan@email.com', id_proof: 'AADHAR-5678', lease_start: '2026-02-01', lease_end: '2027-01-31', rent_amount: 22000, flat_id: 'f9', created_at: '2026-01-28T10:00:00Z', flats: { flat_number: 'C-102', buildings: { name: 'Lake View Residency' } } },
  { id: 't8', full_name: 'Deepak Joshi', phone: '9876543217', email: 'deepak@email.com', id_proof: 'AADHAR-6789', lease_start: '2026-01-15', lease_end: '2027-01-14', rent_amount: 25000, flat_id: 'f11', created_at: '2026-01-12T10:00:00Z', flats: { flat_number: 'D-101', buildings: { name: 'Palm Grove Heights' } } },
];

export const demoPayments = [
  { id: 'p1', payment_amount: 15000, payment_date: '2026-01-05', payment_method: 'bank_transfer', payment_status: 'paid', tenant_id: 't1', flat_id: 'f1', tenants: { full_name: 'Rahul Sharma' }, flats: { flat_number: 'A-101' } },
  { id: 'p2', payment_amount: 15000, payment_date: '2026-02-03', payment_method: 'bank_transfer', payment_status: 'paid', tenant_id: 't1', flat_id: 'f1', tenants: { full_name: 'Rahul Sharma' }, flats: { flat_number: 'A-101' } },
  { id: 'p3', payment_amount: 15000, payment_date: '2026-03-05', payment_method: 'bank_transfer', payment_status: 'paid', tenant_id: 't1', flat_id: 'f1', tenants: { full_name: 'Rahul Sharma' }, flats: { flat_number: 'A-101' } },
  { id: 'p4', payment_amount: 16000, payment_date: '2026-01-10', payment_method: 'online', payment_status: 'paid', tenant_id: 't2', flat_id: 'f2', tenants: { full_name: 'Priya Patel' }, flats: { flat_number: 'A-102' } },
  { id: 'p5', payment_amount: 16000, payment_date: '2026-02-08', payment_method: 'online', payment_status: 'paid', tenant_id: 't2', flat_id: 'f2', tenants: { full_name: 'Priya Patel' }, flats: { flat_number: 'A-102' } },
  { id: 'p6', payment_amount: 16000, payment_date: '2026-03-01', payment_method: 'online', payment_status: 'pending', tenant_id: 't2', flat_id: 'f2', tenants: { full_name: 'Priya Patel' }, flats: { flat_number: 'A-102' } },
  { id: 'p7', payment_amount: 17000, payment_date: '2026-01-15', payment_method: 'cash', payment_status: 'paid', tenant_id: 't3', flat_id: 'f3', tenants: { full_name: 'Amit Kumar' }, flats: { flat_number: 'A-201' } },
  { id: 'p8', payment_amount: 17000, payment_date: '2026-02-18', payment_method: 'cash', payment_status: 'late', tenant_id: 't3', flat_id: 'f3', tenants: { full_name: 'Amit Kumar' }, flats: { flat_number: 'A-201' } },
  { id: 'p9', payment_amount: 12000, payment_date: '2026-01-02', payment_method: 'check', payment_status: 'paid', tenant_id: 't4', flat_id: 'f5', tenants: { full_name: 'Sneha Reddy' }, flats: { flat_number: 'B-101' } },
  { id: 'p10', payment_amount: 12000, payment_date: '2026-02-05', payment_method: 'check', payment_status: 'paid', tenant_id: 't4', flat_id: 'f5', tenants: { full_name: 'Sneha Reddy' }, flats: { flat_number: 'B-101' } },
  { id: 'p11', payment_amount: 12000, payment_date: '2026-03-01', payment_method: 'check', payment_status: 'pending', tenant_id: 't4', flat_id: 'f5', tenants: { full_name: 'Sneha Reddy' }, flats: { flat_number: 'B-101' } },
  { id: 'p12', payment_amount: 13000, payment_date: '2026-02-10', payment_method: 'bank_transfer', payment_status: 'paid', tenant_id: 't5', flat_id: 'f6', tenants: { full_name: 'Vikram Singh' }, flats: { flat_number: 'B-102' } },
  { id: 'p13', payment_amount: 13000, payment_date: '2026-03-01', payment_method: 'bank_transfer', payment_status: 'pending', tenant_id: 't5', flat_id: 'f6', tenants: { full_name: 'Vikram Singh' }, flats: { flat_number: 'B-102' } },
  { id: 'p14', payment_amount: 20000, payment_date: '2026-01-05', payment_method: 'online', payment_status: 'paid', tenant_id: 't6', flat_id: 'f8', tenants: { full_name: 'Ananya Gupta' }, flats: { flat_number: 'C-101' } },
  { id: 'p15', payment_amount: 20000, payment_date: '2026-02-05', payment_method: 'online', payment_status: 'paid', tenant_id: 't6', flat_id: 'f8', tenants: { full_name: 'Ananya Gupta' }, flats: { flat_number: 'C-101' } },
  { id: 'p16', payment_amount: 20000, payment_date: '2026-03-05', payment_method: 'online', payment_status: 'paid', tenant_id: 't6', flat_id: 'f8', tenants: { full_name: 'Ananya Gupta' }, flats: { flat_number: 'C-101' } },
  { id: 'p17', payment_amount: 22000, payment_date: '2026-02-05', payment_method: 'bank_transfer', payment_status: 'paid', tenant_id: 't7', flat_id: 'f9', tenants: { full_name: 'Karan Mehta' }, flats: { flat_number: 'C-102' } },
  { id: 'p18', payment_amount: 22000, payment_date: '2026-03-01', payment_method: 'bank_transfer', payment_status: 'late', tenant_id: 't7', flat_id: 'f9', tenants: { full_name: 'Karan Mehta' }, flats: { flat_number: 'C-102' } },
  { id: 'p19', payment_amount: 25000, payment_date: '2026-02-15', payment_method: 'online', payment_status: 'paid', tenant_id: 't8', flat_id: 'f11', tenants: { full_name: 'Deepak Joshi' }, flats: { flat_number: 'D-101' } },
  { id: 'p20', payment_amount: 25000, payment_date: '2026-03-01', payment_method: 'online', payment_status: 'pending', tenant_id: 't8', flat_id: 'f11', tenants: { full_name: 'Deepak Joshi' }, flats: { flat_number: 'D-101' } },
];

export const demoStats = {
  totalBuildings: 4,
  totalFlats: 12,
  occupiedFlats: 8,
  monthlyCollected: 248000,
  pendingRent: 66000,
  occupancyRate: 67,
  totalTenants: 8,
  latePayments: 2,
};

export const demoMonthlyRevenue = [
  { month: 'Oct', collected: 95000, pending: 22000 },
  { month: 'Nov', collected: 110000, pending: 18000 },
  { month: 'Dec', collected: 125000, pending: 25000 },
  { month: 'Jan', collected: 152000, pending: 28000 },
  { month: 'Feb', collected: 180000, pending: 35000 },
  { month: 'Mar', collected: 248000, pending: 66000 },
];

export const demoOccupancyByBuilding = [
  { name: 'Sunrise Towers', occupied: 3, vacant: 1, total: 4 },
  { name: 'Green Valley', occupied: 2, vacant: 1, total: 3 },
  { name: 'Lake View', occupied: 2, vacant: 1, total: 3 },
  { name: 'Palm Grove', occupied: 1, vacant: 1, total: 2 },
];

export const demoPaymentMethods = [
  { name: 'Bank Transfer', value: 7 },
  { name: 'Online', value: 7 },
  { name: 'Cash', value: 2 },
  { name: 'Check', value: 3 },
];

export const demoRecentActivity = [
  { id: '1', action: 'Payment received', detail: 'Rahul Sharma paid ₹15,000 for A-101', time: '2 hours ago', type: 'payment' as const },
  { id: '2', action: 'New tenant added', detail: 'Deepak Joshi moved into D-101, Palm Grove Heights', time: '5 hours ago', type: 'tenant' as const },
  { id: '3', action: 'Late payment alert', detail: 'Karan Mehta — ₹22,000 overdue for C-102', time: '1 day ago', type: 'alert' as const },
  { id: '4', action: 'Lease renewed', detail: 'Sneha Reddy extended lease for B-101 till Aug 2027', time: '2 days ago', type: 'tenant' as const },
  { id: '5', action: 'Building added', detail: 'Palm Grove Heights (24 flats) registered', time: '3 days ago', type: 'building' as const },
  { id: '6', action: 'Payment received', detail: 'Ananya Gupta paid ₹20,000 for C-101', time: '3 days ago', type: 'payment' as const },
  { id: '7', action: 'Maintenance request', detail: 'Plumbing issue reported at A-201, Sunrise Towers', time: '4 days ago', type: 'alert' as const },
  { id: '8', action: 'Vacancy listed', detail: 'Flat D-201 at Palm Grove Heights marked vacant', time: '5 days ago', type: 'building' as const },
];
