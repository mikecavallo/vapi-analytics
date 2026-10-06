import { MAX_ERROR_BODY_LOG_LENGTH } from "../routes/shared";

// Maximum number of calls that can be fetched in a single request
export const MAX_FETCH_LIMIT = 1000;

// Function to fetch calls from Vapi API with proper query parameters using customer-specific API key
export async function fetchCallsWithFilters(queryParams: Record<string, string>, vapiApiKey: string): Promise<any[]> {
  if (!vapiApiKey) {
    throw new Error("Vapi API key not configured");
  }

  // Enforce maximum limit
  if (queryParams.limit) {
    const requestedLimit = parseInt(queryParams.limit);
    if (isNaN(requestedLimit) || requestedLimit > MAX_FETCH_LIMIT) {
      queryParams.limit = String(MAX_FETCH_LIMIT);
    }
  }

  try {
    console.log(`[${new Date().toLocaleTimeString()}] Fetching calls with filters:`, queryParams);

    // Create an abort controller for timeout - 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestHeaders = {
      "Authorization": `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    };

    // Build URL with the provided query parameters
    const url = new URL("https://api.vapi.ai/call");
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    console.log(`Making API request to: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const rawErrorBody = await response.text();
      const errorBody = rawErrorBody.length > MAX_ERROR_BODY_LOG_LENGTH
        ? `${rawErrorBody.slice(0, MAX_ERROR_BODY_LOG_LENGTH)}…[truncated]`
        : rawErrorBody;
      console.error(`Failed to fetch calls: ${response.status} ${response.statusText}`, { errorBody });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid API key or insufficient permissions");
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`);
    }

    const callsData = await response.json();
    const calls = Array.isArray(callsData) ? callsData : (callsData.data || []);

    // Process calls and add missing fields for filtering compatibility
    const processedCalls = calls.map((call: any) => ({
      ...call,
      assistantName: call.assistant?.name || null,
      customerPhoneNumber: call.customer?.number || call.phoneNumberE164 || null,
      assistantPhoneNumber: call.assistant?.phoneNumber || call.phoneNumber || null,
      // Ensure duration is in seconds (Vapi provides in minutes)
      duration: call.duration ? Math.round(call.duration * 60) :
        (call.endedAt && call.startedAt)
          ? Math.round((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
          : 0,
      // Normalize type field for filtering
      type: call.type === 'inboundPhoneCall' ? 'inbound' : 'outbound',
      // Ensure we have the transcript field
      transcript: call.transcript || "",
      // Add any missing cost field
      cost: call.cost || 0,
      // Ensure createdAt field exists
      createdAt: call.createdAt || call.startedAt,
    }));

    console.log(`Successfully fetched ${processedCalls.length} calls`);
    return processedCalls;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - Vapi API took too long to respond");
    } else if (error.cause?.code === 'UND_ERR_SOCKET') {
      throw new Error("Network connection error with Vapi API");
    } else {
      throw error;
    }
  }
}

export async function fetchRetellCallsWithFilters(queryParams: Record<string, string>, retellApiKey: string): Promise<any[]> {
  if (!retellApiKey) {
    throw new Error("Retell API key not configured");
  }

  // Enforce maximum limit
  if (queryParams.limit) {
    const requestedLimit = parseInt(queryParams.limit);
    if (isNaN(requestedLimit) || requestedLimit > MAX_FETCH_LIMIT) {
      queryParams.limit = String(MAX_FETCH_LIMIT);
    }
  }

  try {
    console.log(`[${new Date().toLocaleTimeString()}] Fetching Retell calls with filters:`, queryParams);

    // Create an abort controller for timeout - 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const requestHeaders = {
      "Authorization": `Bearer ${retellApiKey}`,
      "Content-Type": "application/json",
    };

    // Retell's list-calls API is POST with JSON body
    const url = "https://api.retellai.com/v2/list-calls";

    // Build request body with filter_criteria
    const body: any = {};
    if (queryParams.limit) {
      body.limit = parseInt(queryParams.limit);
    }

    // Retell uses a flat object for filter_criteria with threshold-based date filters
    const filterCriteria: any = {};
    const fromDate = queryParams.createdAtGt || queryParams.createdAtGe;
    const toDate = queryParams.createdAtLt || queryParams.createdAtLe;
    if (fromDate || toDate) {
      const timestampFilter: any = {};
      if (fromDate) timestampFilter.lower_threshold = new Date(fromDate).getTime();
      if (toDate) timestampFilter.upper_threshold = new Date(toDate).getTime();
      filterCriteria.start_timestamp = timestampFilter;
    }
    if (queryParams.assistantId) {
      filterCriteria.agent_id = [queryParams.assistantId];
    }
    if (Object.keys(filterCriteria).length > 0) {
      body.filter_criteria = filterCriteria;
    }

    console.log(`Making Retell API request to: ${url}`, JSON.stringify(body));

    const response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const rawErrorBody = await response.text();
      const errorBody = rawErrorBody.length > MAX_ERROR_BODY_LOG_LENGTH
        ? `${rawErrorBody.slice(0, MAX_ERROR_BODY_LOG_LENGTH)}…[truncated]`
        : rawErrorBody;
      console.error(`Failed to fetch calls: ${response.status} ${response.statusText}`, { errorBody });
      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid API key or insufficient permissions");
      }
      throw new Error(`API call failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ""}`);
    }

    const callsData = await response.json();

    // Retell returns an array of objects
    const calls = Array.isArray(callsData) ? callsData : [];

    // Process calls and normalize them to match Vapi's schema for the standard frontend
    const processedCalls = calls.map((call: any) => ({
      id: call.call_id,
      assistantId: call.agent_id,
      assistantName: null, // We'll need to fetch agent names if possible, or omit
      assistant: { name: null, phoneNumber: call.from_number },
      customer: { number: call.to_number },
      customerPhoneNumber: call.to_number || null,
      assistantPhoneNumber: call.from_number || null,
      type: call.direction === 'inbound' ? 'inbound' : 'outbound',
      status: call.call_status,
      endedReason: call.disconnection_reason,
      duration: call.duration_ms ? Math.round(call.duration_ms / 1000) : 0,
      transcript: call.transcript || "",
      recordingUrl: call.recording_url || null,
      cost: call.cost ? parseFloat(call.cost) : 0,
      createdAt: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : new Date().toISOString(),
      startedAt: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
      endedAt: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
      analysis: call.call_analysis ? {
        summary: call.call_analysis.call_summary,
        successEvaluation: call.call_analysis.call_successful,
        inToAction: call.call_analysis.in_to_action
      } : null,
      successEvaluation: call.call_analysis?.call_successful ? "true" : "false" // mapped directly for ui compat
    }));

    console.log(`Successfully fetched ${processedCalls.length} Retell calls`);
    return processedCalls;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timeout - Retell API took too long to respond");
    } else if (error.cause?.code === 'UND_ERR_SOCKET') {
      throw new Error("Network connection error with Retell API");
    } else {
      throw error;
    }
  }
}
