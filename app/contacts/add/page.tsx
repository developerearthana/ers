"use client";

import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/components/contacts/ContactForm';

export default function AddContactPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/contacts" className="p-2 hover:bg-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Add New Contact</h1>
                    <p className="text-gray-500">Create a new client, vendor, lead or consultant.</p>
                </div>
            </div>
            <Suspense fallback={<div className="glass-card p-6 h-96 flex items-center justify-center">Loading form...</div>}>
                <ContactForm />
            </Suspense>
        </div>
    );
}
