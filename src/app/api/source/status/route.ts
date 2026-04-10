import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const apiKeyConfigured =
    !!process.env.UN_COMTRADE_API_KEY &&
    process.env.UN_COMTRADE_API_KEY !== "not_configured_yet";

  try {
    const url =
      "https://comtradeapi.worldbank.org/data/v1/get/C/A/HS?type=C&freq=A&clCode=HS&period=2023&reporterCode=156&partnerCode=0&cmdCode=TOTAL";

    const res = await fetch(url, {
      headers:
        apiKeyConfigured
          ? {
              "Ocp-Apim-Subscription-Key":
                process.env.UN_COMTRADE_API_KEY as string,
            }
          : {},
      cache: "no-store",
    });

    const status = res.ok ? "Live" : "Restricted";
    const text = res.ok ? "UN Comtrade 真实接口可访问" : `HTTP ${res.status}`;

    await supabase
      .from("data_sources")
      .update({
        is_live_connected: res.ok,
        last_verified_at: new Date().toISOString(),
        access_note: text,
        updated_at: new Date().toISOString(),
      })
      .eq("source_code", "UN_COMTRADE");

    return NextResponse.json({
      source_name: "UN Comtrade",
      source_status: status,
      live_connected: res.ok,
      api_key_required: true,
      api_key_configured: apiKeyConfigured,
      last_verified_at: new Date().toISOString(),
      message: text,
    });
  } catch (error: any) {
    await supabase
      .from("data_sources")
      .update({
        is_live_connected: false,
        last_verified_at: new Date().toISOString(),
        access_note: error?.message || "连接失败",
        updated_at: new Date().toISOString(),
      })
      .eq("source_code", "UN_COMTRADE");

    return NextResponse.json(
      {
        source_name: "UN Comtrade",
        source_status: "Unavailable",
        live_connected: false,
        api_key_required: true,
        api_key_configured: apiKeyConfigured,
        last_verified_at: new Date().toISOString(),
        message: error?.message || "连接失败",
      },
      { status: 500 }
    );
  }
}
