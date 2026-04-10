export function normalizeComtradeRecord(record: any) {
  const reporterCountry = record?.reporterDesc ?? record?.reporterTitle ?? null;
  const partnerCountry = record?.partnerDesc ?? record?.partnerTitle ?? null;
  const flowDesc = record?.flowDesc ?? record?.flowCode ?? null;
  const hsCode = record?.cmdCode ?? null;
  const hsNameEn = record?.cmdDesc ?? record?.cmdDescE ?? null;

  return {
    exporter_country: null,
    importer_country: null,
    reporter_country: reporterCountry,
    partner_country: partnerCountry,
    trade_flow: flowDesc,
    trade_type: "Bilateral",
    year: record?.period ?? record?.refYear ?? null,
    hs_code: hsCode,
    hs_product_name_en: hsNameEn,
    hs_product_name_zh: null,
    trade_value_usd: record?.primaryValue ?? null,
    trade_quantity: record?.qty ?? null,
    quantity_unit: record?.qtyUnitAbbr ?? record?.qtyUnit ?? null,
    data_source: "UN Comtrade",
    source_priority: 1,
    raw_source_note: "本记录由 UN Comtrade 真实接口返回并标准化映射",
    record_confidence: "high",
    verification_status: "raw_api_verified",
  };
}
