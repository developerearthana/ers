import { redirect } from 'next/navigation';

/**
 * Root URL should always land on the login page as per user requirement.
 * This ensures users do not land directly into a "pre-logged-in" portal
 * upon clicking the app link.
 */
export default async function RootPage() {
    redirect('/login');
}
