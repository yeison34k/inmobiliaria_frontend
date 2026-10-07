import { useState, useEffect } from 'react';
import { Modal } from '@shared/ui/Modal.jsx';
import { Badge } from '@shared/ui/Badge.jsx';
import { Spinner } from '@shared/ui/Spinner.jsx';
import { useToast } from '@shared/hooks/useToast.jsx';
import { formatMoney } from '@shared/lib/format.js';
import { useCommission, useOperationMutations } from '../../application/useOperationsQueries.js';
import {
  Beneficiary, BENEFICIARY_LABELS,
  PAYOUT_STATUS_META, PayoutStatus,
} from '../../domain/operation.js';

export function CommissionSplitModal({ operacion, onClose }) {
  const toast = useToast();
  const { data: comision, isLoading, refetch } = useCommission(operacion.id);
  const { setCommission, updatePayoutStatus } = useOperationMutations({
    onError: (e) => toast.error(e.displayMessage),
  });

  const [lineas, setLineas] = useState([]);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (comision?.lineas?.length) {
      setLineas(comision.lineas.map((l) => ({
        id: l.id,
        beneficiario: l.beneficiario,
        usuarioId: l.usuarioId ?? null,
        nombre: l.nombre ?? '',
        porcentaje: Number(l.porcentaje),
        valor: Number(l.valor),
        estado: l.estado,
      })));
    } else {
      // Reparto sugerido por defecto si nunca se ha configurado
      setLineas([
        { beneficiario: Beneficiary.AGENCIA, nombre: 'Agencia', porcentaje: 50, valor: 0, estado: PayoutStatus.PENDIENTE },
        { beneficiario: Beneficiary.CAPTADOR, nombre: operacion.usuario?.nombre || 'Captador', porcentaje: 25, valor: 0, estado: PayoutStatus.PENDIENTE },
        { beneficiario: Beneficiary.VENDEDOR, nombre: operacion.usuario?.nombre || 'Cerrador', porcentaje: 25, valor: 0, estado: PayoutStatus.PENDIENTE },
      ]);
      setEditando(true);
    }
  }, [comision, operacion]);

  const comisionTotal = operacion.comisionValor || 0;
  const sumaPorcentajes = lineas.reduce((acc, l) => acc + (Number(l.porcentaje) || 0), 0);
  const sumaValida = Math.abs(sumaPorcentajes - 100) <= 0.01;

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      { beneficiario: Beneficiary.EXTERNO, nombre: '', porcentaje: 10, valor: 0, estado: PayoutStatus.PENDIENTE },
    ]);
  };

  const quitarLinea = (index) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const actualizarLinea = (index, campo, valor) => {
    const copia = [...lineas];
    copia[index] = { ...copia[index], [campo]: valor };
    setLineas(copia);
  };

  const guardarReparto = async () => {
    if (!sumaValida) {
      toast.error(`El reparto debe sumar exactamente 100% (actual: ${sumaPorcentajes}%)`);
      return;
    }
    const payload = lineas.map((l) => ({
      beneficiario: l.beneficiario,
      usuarioId: l.usuarioId || undefined,
      nombre: l.nombre || undefined,
      porcentaje: Number(l.porcentaje),
    }));

    await setCommission.mutateAsync({ operacionId: operacion.id, lineas: payload });
    toast.success('Reparto de comisiones guardado');
    setEditando(false);
    refetch();
  };

  const cambiarEstadoPago = async (lineaId, nuevoEstado) => {
    await updatePayoutStatus.mutateAsync({ lineaId, estado: nuevoEstado });
    toast.success(`Estado de pago actualizado a ${PAYOUT_STATUS_META[nuevoEstado]?.label}`);
    refetch();
  };

  return (
    <Modal
      title={`Reparto de Comisión · Operación ${operacion.codigo}`}
      onClose={onClose}
      wide
      footer={
        <>
          {editando ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setEditando(false)}>
                Cancelar edición
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!sumaValida || setCommission.isPending}
                onClick={guardarReparto}
              >
                {setCommission.isPending ? 'Guardando...' : 'Guardar reparto'}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setEditando(true)}>
                Modificar reparto
              </button>
              <button type="button" className="btn btn--primary" onClick={onClose}>
                Listo
              </button>
            </>
          )}
        </>
      }
    >
      <div className="commission-modal">
        {/* Resumen financiero */}
        <header className="panel panel--bordered" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <small className="text-muted">Propiedad / Tipo</small>
              <h3 style={{ margin: '2px 0 0' }}>{operacion.propiedad?.titulo ?? 'Inmueble'}</h3>
              <p className="text-muted" style={{ margin: '2px 0 0' }}>
                Precio final: <strong>{formatMoney(operacion.precioCierre)}</strong> ({operacion.comisionPorcentaje}% comisión)
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <small className="text-muted">Honorario total a repartir</small>
              <h2 style={{ color: 'var(--primary)', margin: '2px 0 0' }}>
                {formatMoney(comisionTotal)}
              </h2>
            </div>
          </div>
        </header>

        {isLoading ? <Spinner label="Cargando comisiones..." /> : null}

        {/* Tabla o formulario de reparto */}
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Beneficiario</th>
                <th>Nombre / Asesor</th>
                <th>Porcentaje (%)</th>
                <th>Monto liquidado</th>
                <th>Estado de pago</th>
                {editando ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {lineas.map((linea, index) => {
                const valorCalculado = Math.round(comisionTotal * ((Number(linea.porcentaje) || 0) / 100));
                return (
                  <tr key={linea.id || index}>
                    <td>
                      {editando ? (
                        <select
                          value={linea.beneficiario}
                          onChange={(e) => actualizarLinea(index, 'beneficiario', e.target.value)}
                        >
                          {Object.entries(BENEFICIARY_LABELS).map(([k, label]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge tone="neutral">{BENEFICIARY_LABELS[linea.beneficiario] ?? linea.beneficiario}</Badge>
                      )}
                    </td>
                    <td>
                      {editando ? (
                        <input
                          placeholder="Nombre del beneficiario"
                          value={linea.nombre}
                          onChange={(e) => actualizarLinea(index, 'nombre', e.target.value)}
                        />
                      ) : (
                        <strong>{linea.nombre || '—'}</strong>
                      )}
                    </td>
                    <td style={{ width: '130px' }}>
                      {editando ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={linea.porcentaje}
                            onChange={(e) => actualizarLinea(index, 'porcentaje', e.target.value)}
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        <span>{linea.porcentaje}%</span>
                      )}
                    </td>
                    <td>
                      <strong>{formatMoney(valorCalculado)}</strong>
                    </td>
                    <td>
                      <Badge tone={PAYOUT_STATUS_META[linea.estado]?.tone ?? 'neutral'}>
                        {PAYOUT_STATUS_META[linea.estado]?.label ?? linea.estado}
                      </Badge>
                      {!editando && linea.id ? (
                        <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '8px' }}>
                          {linea.estado === PayoutStatus.PENDIENTE ? (
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              onClick={() => cambiarEstadoPago(linea.id, PayoutStatus.FACTURADO)}
                            >
                              Facturar
                            </button>
                          ) : null}
                          {linea.estado !== PayoutStatus.PAGADO ? (
                            <button
                              type="button"
                              className="btn btn--primary btn--sm"
                              onClick={() => cambiarEstadoPago(linea.id, PayoutStatus.PAGADO)}
                            >
                              Pagar
                            </button>
                          ) : (
                            <small className="text-muted">✓ Pagado</small>
                          )}
                        </div>
                      ) : null}
                    </td>
                    {editando ? (
                      <td className="table__actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm text-danger"
                          onClick={() => quitarLinea(index)}
                          disabled={lineas.length <= 1}
                        >
                          Quitar
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2">
                  {editando ? (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={agregarLinea}>
                      + Añadir beneficiario
                    </button>
                  ) : null}
                </th>
                <th style={{ color: sumaValida ? 'var(--success, #16a34a)' : '#dc2626' }}>
                  Total: {Math.round(sumaPorcentajes * 100) / 100}%
                  {!sumaValida ? <small style={{ display: 'block' }}>Debe ser 100%</small> : null}
                </th>
                <th>{formatMoney(comisionTotal)}</th>
                <th colSpan={editando ? 2 : 1} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
}
