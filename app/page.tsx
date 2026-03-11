import { redirect } from 'next/navigation';

// Root URL always sends users to the login page.
// After logging in, the authenticate action handles the role-based redirect.
export default async function RootPage() {
    redirect('/login');
}
