import { Badge } from '@shared/ui/Badge.jsx';
import { STATUS_META } from '../../domain/property.js';

export function PropertyStatusBadge({ estado }) {
  const meta = STATUS_META[estado] ?? { label: estado, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
