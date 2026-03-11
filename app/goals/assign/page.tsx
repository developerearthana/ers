import KPIAssignmentManager from '@/components/kpi/KPIAssignmentManager';

export const metadata = {
  title: 'Assign Goals | Earthana',
  description: 'Assign KPIs and goals to teams and users.',
};

export default function AssignGoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assign Goals</h1>
        <p className="text-gray-500">Assign KPIs to teams or individual members and track their progress.</p>
      </div>
      <KPIAssignmentManager />
    </div>
  );
}
