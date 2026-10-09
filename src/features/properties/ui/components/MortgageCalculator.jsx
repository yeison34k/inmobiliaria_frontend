import { useState } from 'react';
import { useTranslation } from '@shared/i18n/index.js';
import './MortgageCalculator.css';

const CUOTA_INICIAL_PRESETS = [10, 20, 30, 40, 50, 70];
const PLAZO_PRESETS = [5, 10, 15, 20, 25, 30];

export function MortgageCalculator({ precio, moneda = 'COP', onConsultarCredito }) {
  const { formatMoney, isEn } = useTranslation();
  const [cuotaInicialPct, setCuotaInicialPct] = useState(30);
  const [plazoAnios, setPlazoAnios] = useState(20);
  const [tasaAnual, setTasaAnual] = useState(12.0); // % E.A.

  const tasaPresets = [
    { label: isEn ? 'Prime 10.5%' : 'Preferencial 10.5%', value: 10.5 },
    { label: isEn ? 'Average Bank 12.0%' : 'Banca Promedio 12.0%', value: 12.0 },
    { label: isEn ? 'Market 13.5%' : 'Mercado 13.5%', value: 13.5 },
  ];

  const precioNum = Number(precio) || 0;
  const cuotaInicialValor = Math.round(precioNum * (cuotaInicialPct / 100));
  const montoPrestamo = Math.max(0, precioNum - cuotaInicialValor);

  // Conversión financiera exacta de Tasa Efectiva Anual a Tasa Periódica Mensual
  // i = (1 + EA)^(1/12) - 1
  const n = plazoAnios * 12;
  const i = tasaAnual > 0 ? Math.pow(1 + tasaAnual / 100, 1 / 12) - 1 : 0;

  // Fórmula de amortización francesa de cuota fija:
  // C = P * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
  let cuotaMensual = 0;
  if (montoPrestamo > 0 && n > 0) {
    if (i > 0) {
      const factor = Math.pow(1 + i, n);
      cuotaMensual = Math.round((montoPrestamo * (i * factor)) / (factor - 1));
    } else {
      cuotaMensual = Math.round(montoPrestamo / n);
    }
  }

  const totalPagar = cuotaMensual * n;
  const totalIntereses = Math.max(0, totalPagar - montoPrestamo);

  // Proporción aproximada en las cuotas iniciales (interés vs capital)
  const interesMes1 = Math.round(montoPrestamo * i);
  const capitalMes1 = Math.max(0, cuotaMensual - interesMes1);
  const pctCapital = cuotaMensual > 0 ? Math.min(100, Math.max(5, Math.round((capitalMes1 / cuotaMensual) * 100))) : 25;
  const pctInteres = 100 - pctCapital;

  return (
    <article className="mortgage-calc" id="calculadora-hipotecaria">
      <header className="mortgage-calc__header">
        <p className="mortgage-calc__kicker">{isEn ? 'Financial Simulator' : 'Simulador Financiero'}</p>
        <h2 className="mortgage-calc__title">
          {isEn ? 'Mortgage Loan Calculator' : 'Calculadora de Crédito Hipotecario'}
        </h2>
        <p className="mortgage-calc__subtitle">
          {isEn
            ? 'Estimate your investment plan, monthly payments, and financing options for this property.'
            : 'Proyecte su esquema de inversión, cuotas mensuales y opciones de financiación con amortización gradual en pesos para esta propiedad.'}
        </p>
      </header>

      <div className="mortgage-calc__layout">
        {/* ================= COLUMNA 1: PARÁMETROS INTERACTIVOS ================= */}
        <div className="mortgage-calc__controls">
          {/* Tarjeta 1: Cuota Inicial */}
          <div className="mortgage-card">
            <div className="mortgage-card__head">
              <span className="mortgage-card__label">{isEn ? 'Down Payment' : 'Cuota Inicial'}</span>
              <div className="mortgage-card__metric">
                <span className="mortgage-card__badge">{cuotaInicialPct}%</span>
                <span className="mortgage-card__value">{formatMoney(cuotaInicialValor, moneda)}</span>
              </div>
            </div>

            <div className="mortgage-range-wrapper">
              <input
                type="range"
                className="mortgage-range"
                min="10"
                max="80"
                step="5"
                value={cuotaInicialPct}
                onChange={(e) => setCuotaInicialPct(Number(e.target.value))}
                aria-label={isEn ? 'Down payment percentage' : 'Porcentaje de cuota inicial'}
              />
            </div>

            <div className="mortgage-chips">
              {CUOTA_INICIAL_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`mortgage-chip ${cuotaInicialPct === pct ? 'mortgage-chip--active' : ''}`}
                  onClick={() => setCuotaInicialPct(pct)}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta 2: Plazo del Crédito */}
          <div className="mortgage-card">
            <div className="mortgage-card__head">
              <span className="mortgage-card__label">{isEn ? 'Financing Term' : 'Plazo de Financiación'}</span>
              <div className="mortgage-card__metric">
                <span className="mortgage-card__badge">
                  {n} {isEn ? 'installments' : 'cuotas'}
                </span>
                <span className="mortgage-card__value">
                  {plazoAnios} {isEn ? 'years' : 'años'}
                </span>
              </div>
            </div>

            <div className="mortgage-range-wrapper">
              <input
                type="range"
                className="mortgage-range"
                min="5"
                max="30"
                step="1"
                value={plazoAnios}
                onChange={(e) => setPlazoAnios(Number(e.target.value))}
                aria-label={isEn ? 'Term in years' : 'Plazo en años'}
              />
            </div>

            <div className="mortgage-chips">
              {PLAZO_PRESETS.map((anios) => (
                <button
                  key={anios}
                  type="button"
                  className={`mortgage-chip ${plazoAnios === anios ? 'mortgage-chip--active' : ''}`}
                  onClick={() => setPlazoAnios(anios)}
                >
                  {anios} {isEn ? 'years' : 'años'}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta 3: Tasa de Interés */}
          <div className="mortgage-card">
            <div className="mortgage-card__head">
              <span className="mortgage-card__label">{isEn ? 'Estimated Interest Rate' : 'Tasa de Interés Estimada'}</span>
              <div className="mortgage-card__metric">
                <span className="mortgage-card__badge">{(i * 100).toFixed(2)}% M.V.</span>
                <span className="mortgage-card__value">{tasaAnual.toFixed(1)}% E.A.</span>
              </div>
            </div>

            <div className="mortgage-rate-row">
              <div className="mortgage-rate-input-wrap">
                <input
                  type="number"
                  className="mortgage-rate-input"
                  min="5"
                  max="25"
                  step="0.1"
                  value={tasaAnual}
                  onChange={(e) => setTasaAnual(Math.max(1, Number(e.target.value)))}
                  aria-label={isEn ? 'Effective annual interest rate' : 'Tasa de interés efectiva anual'}
                />
                <span className="mortgage-rate-suffix">% E.A.</span>
              </div>
              <span className="mortgage-rate-hint">
                {isEn ? 'Representative mortgage interest rate in Colombia.' : 'Tasa representativa de crédito hipotecario vigente en Colombia.'}
              </span>
            </div>

            <div className="mortgage-chips">
              {tasaPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`mortgage-chip ${Math.abs(tasaAnual - preset.value) < 0.05 ? 'mortgage-chip--active' : ''}`}
                  onClick={() => setTasaAnual(preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLUMNA 2: RESUMEN EJECUTIVO ================= */}
        <div className="mortgage-summary">
          {/* Métrica principal: Cuota mensual */}
          <div className="mortgage-hero-metric">
            <p className="mortgage-hero-metric__kicker">{isEn ? 'Estimated monthly payment' : 'Cuota mensual estimada'}</p>
            <h3 className="mortgage-hero-metric__amount">
              {formatMoney(cuotaMensual, moneda)}
              <span className="mortgage-hero-metric__unit">{isEn ? '/ mo' : '/ mes'}</span>
            </h3>
            <p className="mortgage-hero-metric__note">
              {isEn
                ? 'Fixed payment plan. Includes capital amortization and interest.'
                : 'Cuota fija en pesos. Incluye amortización a capital e intereses.'}
            </p>
          </div>

          {/* Gráfico de distribución de la primera cuota */}
          <div className="mortgage-amort-bar">
            <div className="mortgage-amort-bar__legend">
              <span><strong>{pctCapital}%</strong> {isEn ? 'Principal' : 'Abono a capital'}</span>
              <span><strong>{pctInteres}%</strong> {isEn ? 'Interest' : 'Intereses'}</span>
            </div>
            <div className="mortgage-amort-bar__track" title={`Capital: ${pctCapital}% | Intereses: ${pctInteres}%`}>
              <div className="mortgage-amort-bar__fill-capital" style={{ width: `${pctCapital}%` }} />
              <div className="mortgage-amort-bar__fill-interest" style={{ width: `${pctInteres}%` }} />
            </div>
          </div>

          {/* Desglose detallado de inversión */}
          <div className="mortgage-breakdown">
            <div className="mortgage-breakdown__row">
              <span className="mortgage-breakdown__label">{isEn ? 'Property price' : 'Precio de la propiedad'}</span>
              <strong className="mortgage-breakdown__value">{formatMoney(precioNum, moneda)}</strong>
            </div>

            <div className="mortgage-breakdown__row">
              <span className="mortgage-breakdown__label">
                {isEn ? `Down payment (${cuotaInicialPct}%)` : `Cuota inicial (${cuotaInicialPct}%)`}
              </span>
              <strong className="mortgage-breakdown__value">{formatMoney(cuotaInicialValor, moneda)}</strong>
            </div>

            <div className="mortgage-breakdown__row mortgage-breakdown__row--highlight">
              <span className="mortgage-breakdown__label">
                {isEn ? 'Loan amount to request' : 'Monto financiado a solicitar'}
              </span>
              <strong className="mortgage-breakdown__value">{formatMoney(montoPrestamo, moneda)}</strong>
            </div>

            <div className="mortgage-breakdown__row">
              <span className="mortgage-breakdown__label">
                {isEn ? `Projected interest (${plazoAnios} years)` : `Intereses proyectados (${plazoAnios} años)`}
              </span>
              <strong className="mortgage-breakdown__value">{formatMoney(totalIntereses, moneda)}</strong>
            </div>
          </div>

          {/* Botón de acción comercial */}
          {onConsultarCredito ? (
            <button
              type="button"
              className="mortgage-cta-btn"
              onClick={() => onConsultarCredito(cuotaMensual, montoPrestamo)}
            >
              <span>{isEn ? 'Request mortgage advisory for this property' : 'Solicitar asesoría de crédito para esta propiedad'}</span>
              <span aria-hidden="true">→</span>
            </button>
          ) : null}

          {/* Disclaimer legal bancario */}
          <p className="mortgage-disclaimer">
            {isEn
              ? '* Estimated figures and rates calculated under standard fixed amortization. Does not include mandatory insurance policies. Final approval and definitive rate depend on financial institution credit approval.'
              : '* Valores y tasas de carácter ilustrativo calculados bajo sistema de amortización gradual en pesos. No incluye pólizas obligatorias de seguro de vida e incendio/terremoto. La aprobación final y tasa definitiva dependen del estudio crediticio de la entidad financiera.'}
          </p>
        </div>
      </div>
    </article>
  );
}
