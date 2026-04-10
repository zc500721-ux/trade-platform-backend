import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchComtradeData } from "@/lib/comtrade";
import { normalizeComtradeRecord } from "@/lib/normalize";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const queryHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(body))
    .digest("hex");

  try {
    const result = await fetchComtradeData({
      reporterCodes: body.reporterCodes || [],
      partnerCodes: body.partnerCodes || [],
      flowCode: body.flowCode,
      startYear: body.startYear,
      endYear: body.endYear,
      hsCodes: body.hsCodes || [],
    });

    const normalized = result.records.map(normalizeComtradeRecord);

    await supabase.from("query_logs").insert({
      query_hash: queryHash,
      source_code: "UN_COMTRADE",
      request_params: body,
      response_status: result.ok ? "success" : "partial_or_failed",
      result_count: normalized.length,
      query_status: result.ok ? "completed" : "failed",
      error_message: result.errors.join(" | ") || null,
      is_live_query: true,
    });

    if (normalized.length > 0) {
      await supabase.from("trade_records").insert(normalized);
    }

    return NextResponse.json({
      message: `已完成 UN Comtrade 真实检索，已返回 ${normalized.length} 条真实记录`,
      result_count: normalized.length,
      records: normalized,
      errors: result.errors,
      is_live_query: true,
    });
  } catch (error: any) {
    await supabase.from("query_logs").insert({
      query_hash,queryHash
      source_code: "UN_COMTRADE",
      request_params: body,
      response_status: "failed",
      result_count: 0,
      query_status: "failed",
      error_message: error?.message || "查询失败",
      is_live_query: true,
    });

    return NextResponse.json(
      {
        message: "UN Comtrade 真实接口请求失败",
        result_count: 0,
        records: [],
        errors: [error?.message || "查询失败"],
        is_live_query: true,
      },
      { status: 500 }
    );
  }
}
