import { TransactionForm } from "@/components/accounts/TransactionForm";

export default function NewTransactionPage() {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Add Online Transaction</h1>
            <TransactionForm mode="Online" />
        </div>
    );
}
