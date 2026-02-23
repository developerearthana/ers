import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import ContactTable from '@/components/contacts/ContactTable';
import { getContacts } from '@/app/actions/contacts';

export default async function VendorsPage() {
    const { data: contacts } = await getContacts({ type: 'Vendor' });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
                    <p className="text-gray-500">Manage your suppliers and service providers.</p>
                </div>
                <Link href="/contacts/add?type=Vendor">
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Vendor
                    </button>
                </Link>
            </div>

            <ContactTable filterType="Vendor" contacts={contacts || []} />
        </div>
    );
}
