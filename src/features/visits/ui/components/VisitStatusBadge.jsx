import { Badge } from '@shared/ui/Badge.jsx';
import { VISIT_OUTCOME_META, VISIT_STATUS_META } from '../../domain/visit.js';

export function VisitStatusBadge({ estado }) {
  const meta = VISIT_STATUS_META[estado] ?? { label: estado, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export function VisitOutcomeBadge({ resultado }) {
  if (!resultado) return null;
  const meta = VISIT_OUTCOME_META[resultado] ?? { label: resultado, tone: 'neutral' };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
