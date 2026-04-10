export type TradeQueryInput = {
  reporterCodes: string[];
  partnerCodes: string[];
  flowCode?: string;
  startYear: number;
  endYear: number;
  hsCodes: string[];
};

export async function fetchComtradeData(input: TradeQueryInput) {
  const apiKey = process.env.UN_COMTRADE_API_KEY;
  const years = Array.from(
    { length: input.endYear - input.startYear + 1 },
    (_, i) => input.startYear + i
  );

  const allResults: any[] = [];
  const errors: string[] = [];

  for (const year of years) {
    const params = new URLSearchParams({
      type: "C",
      freq: "A",
      clCode: "HS",
      period: String(year),
      reporterCode: input.reporterCodes.join(","),
      partnerCode: input.partnerCodes.join(","),
      cmdCode: input.hsCodes.join(","),
    });

    if (input.flowCode) {
      params.set("flowCode", input.flowCode);
    }

    const url = `https://comtradeapi.worldbank.org/data/v1/get/C/A/HS?${params.toString()}`;

    const res = await fetch(url, {
      headers:
        apiKey && apiKey !== "not_configured_yet"
          ? { "Ocp-Apim-Subscription-Key": apiKey }
          : {},
      cache: "no-store",
    });

    if (!res.ok) {
      errors.push(`year ${year}: ${res.status} ${res.statusText}`);
      continue;
    }

    const json = await res.json();
    const data = json?.data ?? json?.dataset ?? [];
    if (Array.isArray(data)) {
      allResults.push(...data);
    }
  }

  return {
    ok: errors.length === 0 || allResults.length > 0,
    records: allResults,
    errors,
  };
}
