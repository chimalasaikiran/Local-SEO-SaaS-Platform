"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SEED_PASSWORD = 'password123'; // Development only!
async function runSeed() {
    const client = await db_1.default.connect();
    try {
        console.log('Starting seed...');
        await client.query('BEGIN');
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(SEED_PASSWORD, 10);
        // Create Users
        const users = [
            { email: 'owner@example.com', name: 'Owner User' },
            { email: 'admin@example.com', name: 'Admin User' },
            { email: 'member@example.com', name: 'Member User' },
            { email: 'viewer@example.com', name: 'Viewer User' },
            { email: 'xyz.owner@example.com', name: 'XYZ Owner' }
        ];
        const createdUsers = {};
        for (const u of users) {
            const res = await client.query(`INSERT INTO users (email, password_hash, name) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id, email`, [u.email, passwordHash, u.name]);
            createdUsers[res.rows[0].email] = res.rows[0].id;
        }
        // Create Organizations
        const orgs = [
            { name: 'ABC Digital Agency', slug: 'abc-digital-agency' },
            { name: 'XYZ Marketing', slug: 'xyz-marketing' }
        ];
        const createdOrgs = {};
        for (const o of orgs) {
            const res = await client.query(`INSERT INTO organizations (name, slug) 
         VALUES ($1, $2) 
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id, slug`, [o.name, o.slug]);
            createdOrgs[res.rows[0].slug] = res.rows[0].id;
        }
        // Create Memberships for ABC Digital Agency
        const abcOrgId = createdOrgs['abc-digital-agency'];
        const abcMemberships = [
            { email: 'owner@example.com', role: 'OWNER' },
            { email: 'admin@example.com', role: 'ADMIN' },
            { email: 'member@example.com', role: 'MEMBER' },
            { email: 'viewer@example.com', role: 'VIEWER' }
        ];
        for (const m of abcMemberships) {
            await client.query(`INSERT INTO organization_memberships (organization_id, user_id, role) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role`, [abcOrgId, createdUsers[m.email], m.role]);
        }
        // Create Memberships for XYZ Marketing
        const xyzOrgId = createdOrgs['xyz-marketing'];
        await client.query(`INSERT INTO organization_memberships (organization_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role`, [xyzOrgId, createdUsers['xyz.owner@example.com'], 'OWNER']);
        // Create Businesses for ABC Digital Agency
        const businesses = [
            { name: 'Sharma Dental', slug: 'sharma-dental', primary_category: 'Dentist', description: 'Dental clinic in Hyderabad', website_url: 'https://sharmadental.com', phone: '+919999999991' },
            { name: 'Krishna Restaurant', slug: 'krishna-restaurant', primary_category: 'Restaurant', description: 'South Indian Restaurant', website_url: 'https://krishnarestaurant.com', phone: '+919999999992' },
            { name: 'Sai Fitness', slug: 'sai-fitness', primary_category: 'Gym', description: 'Fitness center', website_url: 'https://saifitness.com', phone: '+919999999993' }
        ];
        const createdBusinesses = {};
        for (const b of businesses) {
            const res = await client.query(`INSERT INTO businesses (organization_id, name, slug, primary_category, description, website_url, phone) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (organization_id, slug) DO UPDATE SET name = EXCLUDED.name 
         RETURNING id, slug`, [abcOrgId, b.name, b.slug, b.primary_category, b.description, b.website_url, b.phone]);
            createdBusinesses[res.rows[0].slug] = res.rows[0].id;
        }
        // Create Locations for ABC Digital Agency
        const locations = [
            { business_slug: 'sharma-dental', name: 'Sharma Dental - Hyderabad', address_line_1: '123 Banjara Hills', city: 'Hyderabad', state: 'Telangana', country: 'India' },
            { business_slug: 'sharma-dental', name: 'Sharma Dental - Secunderabad', address_line_1: '456 SD Road', city: 'Secunderabad', state: 'Telangana', country: 'India' },
            { business_slug: 'krishna-restaurant', name: 'Krishna Restaurant - Hyderabad', address_line_1: '789 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', country: 'India' },
            { business_slug: 'sai-fitness', name: 'Sai Fitness - Hyderabad', address_line_1: '101 Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India' },
            { business_slug: 'sai-fitness', name: 'Sai Fitness - Bangalore', address_line_1: '202 Indiranagar', city: 'Bangalore', state: 'Karnataka', country: 'India' }
        ];
        for (const l of locations) {
            // For idempotency, we can insert without ON CONFLICT since locations don't have a unique constraint besides ID.
            // But let's check if it exists just to avoid duplicate rows on multiple seed runs.
            const existing = await client.query(`SELECT id FROM locations WHERE organization_id = $1 AND business_id = $2 AND name = $3`, [abcOrgId, createdBusinesses[l.business_slug], l.name]);
            if (existing.rowCount === 0) {
                await client.query(`INSERT INTO locations (organization_id, business_id, name, address_line_1, city, state, country) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`, [abcOrgId, createdBusinesses[l.business_slug], l.name, l.address_line_1, l.city, l.state, l.country]);
            }
        }
        // Create Keywords for Sharma Dental - Hyderabad
        const sharmaDentalBusId = createdBusinesses['sharma-dental'];
        const hydLocation = await client.query(`SELECT id FROM locations WHERE organization_id = $1 AND business_id = $2 AND name = $3`, [abcOrgId, sharmaDentalBusId, 'Sharma Dental - Hyderabad']);
        if (hydLocation.rowCount && hydLocation.rowCount > 0) {
            const hydLocId = hydLocation.rows[0].id;
            const seedKeywords = [
                'dentist',
                'dentist near me',
                'dental clinic',
                'dental implants',
                'root canal dentist',
                'teeth whitening',
                'orthodontist'
            ];
            for (const kw of seedKeywords) {
                const normalized = kw.toLowerCase().trim();
                const existingKw = await client.query(`SELECT id FROM keywords WHERE organization_id = $1 AND location_id = $2 AND normalized_keyword = $3`, [abcOrgId, hydLocId, normalized]);
                if (existingKw.rowCount === 0) {
                    await client.query(`INSERT INTO keywords (
              organization_id, business_id, location_id, keyword, normalized_keyword, 
              search_engine, country_code, language_code, device
            ) VALUES ($1, $2, $3, $4, $5, 'GOOGLE', 'IN', 'en', 'DESKTOP')`, [abcOrgId, sharmaDentalBusId, hydLocId, kw, normalized]);
                }
            }
        }
        await client.query('COMMIT');
        console.log('Seed completed successfully!');
        console.log('Development credentials:');
        for (const u of users) {
            console.log(`- ${u.email} / ${SEED_PASSWORD}`);
        }
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', error);
    }
    finally {
        client.release();
        db_1.default.end();
    }
}
runSeed();
