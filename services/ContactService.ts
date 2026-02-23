import connectToDatabase from '@/lib/db';
import Contact, { IContact } from '@/models/Contact';
import { sanitizeObject } from '@/lib/sanitize';

import { salesService } from './SalesService';

export class ContactService {
    /**
     * Create a new contact
     */
    async createContact(data: Partial<IContact>) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const contact = await Contact.create(sanitized);

        // Auto-create Sales Lead if type is 'Lead'
        // Auto-create Sales Lead if type is 'Lead'
        if (contact.type === 'Lead') {
            try {
                await salesService.createLead({
                    name: contact.name,
                    company: contact.company || 'N/A',
                    email: contact.email,
                    phone: contact.phone,
                    status: 'New',
                    contactId: contact._id,
                    source: 'Contact Module'
                });
            } catch (error) {
                console.error("Failed to auto-create sales lead:", error);
                // Don't fail the contact creation if lead creation fails, but maybe log it
            }
        }

        return JSON.parse(JSON.stringify(contact));
    }

    /**
     * Get all contacts with optional filtering
     */
    async getContacts(filters: any = {}) {
        await connectToDatabase();

        const query: any = {};
        if (filters.type && filters.type !== 'All Contacts') {
            query.type = filters.type; // Assuming frontend sends 'Client', 'Vendor' etc.
        }
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { company: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        const contacts = await Contact.find(query)
            .sort({ updatedAt: -1 })
            .lean();

        return JSON.parse(JSON.stringify(contacts)).map((c: any) => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email,
            phone: c.phone || 'N/A',
            role: c.type, // UI uses 'role' for Type sometimes? Need to check Table.
            type: c.type,
            company: c.company || 'N/A',
            status: c.status,
            category: c.category,
            location: c.address || 'N/A'
        }));
    }

    /**
     * Get Contact Dashboard Stats
     */
    async getStats() {
        await connectToDatabase();

        const [total, clients, vendors, leads] = await Promise.all([
            Contact.countDocuments({ status: 'Active' }),
            Contact.countDocuments({ type: 'Client', status: 'Active' }),
            Contact.countDocuments({ type: 'Vendor', status: 'Active' }),
            Contact.countDocuments({ type: 'Lead' }) // Leads from Contact model if used there
        ]);

        return {
            total,
            clients,
            vendors,
            leads
        };
    }
    /**
     * Update a contact
     */
    async updateContact(id: string, data: Partial<IContact>) {
        await connectToDatabase();
        const sanitized = sanitizeObject(data);
        const contact = await Contact.findByIdAndUpdate(id, sanitized, { new: true });
        if (!contact) throw new Error("Contact not found");
        return JSON.parse(JSON.stringify(contact));
    }

    /**
     * Delete a contact
     */
    async deleteContact(id: string) {
        await connectToDatabase();
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) throw new Error("Contact not found");
        return true;
    }
}

export const contactService = new ContactService();
