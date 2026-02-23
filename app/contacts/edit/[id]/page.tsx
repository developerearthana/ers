import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/contacts/ContactForm';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/db';
import Contact from '@/models/Contact';

// Fetch contact server-side
async function getContact(id: string) {
    await connectToDatabase();
    const contact = await Contact.findById(id).lean();
    if (!contact) return null;
    return JSON.parse(JSON.stringify(contact));
}

export default async function EditContactPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const contact = await getContact(id);

    if (!contact) {
        notFound();
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/contacts" className="p-2 hover:bg-background rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Edit Contact</h1>
                    <p className="text-gray-500">Update contact details.</p>
                </div>
            </div>
            <Suspense fallback={<div className="glass-card p-6 h-96 flex items-center justify-center">Loading form...</div>}>
                <ContactForm initialData={contact} isEdit={true} />
            </Suspense>
        </div>
    );
}
