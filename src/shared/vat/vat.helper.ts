export interface VatInput {
  unitPriceGross: number;
  unitPriceNet?: number;
  vatAmount?: number;
  vatRate?: number;
}

export interface VatResult {
  unitPriceGross: number;
  unitPriceNet: number;
  vatAmount: number;
}

export function applyVatRate(input: VatInput): VatResult {
  const { unitPriceGross: gross, unitPriceNet: net, vatAmount, vatRate } = input;

  if (vatRate !== undefined) {
    const factor = 1 + vatRate / 100;
    const calculatedNet = round(gross / factor);
    const calculatedVat = gross - calculatedNet;
    return { unitPriceGross: gross, unitPriceNet: calculatedNet, vatAmount: calculatedVat };
  }

  return {
    unitPriceGross: gross,
    unitPriceNet: net ?? gross,
    vatAmount: vatAmount ?? 0,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
