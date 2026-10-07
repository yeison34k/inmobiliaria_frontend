import { Badge } from '@shared/ui/Badge.jsx';
import { OPERATION_STATUS_META } from '../../domain/operation.js';

export function OperationStatusBadge({ estado }) {
  const meta = OPERATION_STATUS_META[estado] ?? { label: estado, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
