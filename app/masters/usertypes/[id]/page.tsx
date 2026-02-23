import { UserTypeForm } from "@/components/admin/UserTypeForm";
import { getRole } from "@/app/actions/role";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditUserTypePage({ params }: PageProps) {
    const { id } = await params;
    const role = await getRole(id);

    if (!role) {
        notFound();
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <UserTypeForm initialData={role} isEditing={true} />
        </div>
    );
}
