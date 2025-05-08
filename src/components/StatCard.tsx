import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatCard({
  title,
  value,
  valueColor = '',
}: {
  title: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Card className="rounded-xs shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-semibold ${valueColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}