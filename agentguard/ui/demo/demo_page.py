def get_demo_html() -> str:
    return """
    <!DOCTYPE html>
    <html>
    <head>
      <title>AgentGuard Demo</title>
      <style>
        body {
          font-family: Arial;
          padding: 40px;
          background: #f5f5f5;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 900px;
        }

        button {
          padding: 12px 20px;
          margin-right: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background: #111827;
          color: white;
        }

        pre {
          background: #111827;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          overflow: auto;
        }

        .approved {
          color: green;
          font-weight: bold;
        }

        .blocked {
          color: red;
          font-weight: bold;
        }

        .review {
          color: orange;
          font-weight: bold;
        }

        .audit-toggle {
          margin-top: 12px;
          background: #1f2937;
        }

        .audit-panel {
          margin-top: 14px;
          padding: 14px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: #f9fafb;
        }
      </style>
    </head>

    <body>
      <div class="card">
        <h1>AgentGuard 정책 기반 실행 통제 데모</h1>

        <div style="margin-bottom: 16px;">
          <p>이 화면은 AI Agent의 송금 요청을 테스트하는 데모입니다.
          AgentGuard는 요청한 송금이 안전한지 확인한 뒤, 승인된 경우에만 XRPL 테스트넷에 전송합니다.</p>
          <p style="font-size: 13px; color: #b45309;">입력한 지갑 정보가 해당 Agent의 권한과 일치하는지도 함께 확인합니다.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
          <input id="signerSeedInput" type="password" placeholder="XRPL Signer Seed 입력 (s...)" />
          <small style="font-size: 12px; color: #6b7280;">
            데모 환경에서는 signer seed를 직접 입력하지만, 실제 운영 환경에서는 Vault/HSM 기반 보안 signer를 사용합니다.
          </small>
          <input id="agentIdInput" type="text" value="did:openentry:agent:treasury-01" />
          <input id="destinationInput" type="text" placeholder="받는 XRPL 주소 입력 (r...)" />
          <input id="amountInput" type="number" placeholder="보내는 액수 입력" value="1000000" />
          <small>1 XRP = 1,000,000 drops</small>
          <input id="purposeInput" type="text" value="treasury" />
        </div>

        <button onclick="runPreview()">Preview</button>
        <button onclick="runExecution()">Execute</button>

        <div id="result" style="margin-top:20px;">
          아직 실행 결과가 없습니다.
        </div>
      </div>

      <script>
      function buildPayload() {
        return {
          agent_id: document.getElementById("agentIdInput").value,
          action: "xrpl_payment",
          amount: Number(document.getElementById("amountInput").value),
          destination: document.getElementById("destinationInput").value,
          signer_seed: document.getElementById("signerSeedInput").value,
          purpose: document.getElementById("purposeInput").value,
          context: {
            demo_risk_mode: true,
            source: "web_demo"
          }
        };
      }

      function validateInput() {
        const payload = buildPayload();
        if (!payload.destination || !payload.destination.startsWith("r")) {
          return "invalid_destination";
        }
        if (!payload.signer_seed || !payload.signer_seed.startsWith("s")) {
          return "invalid_signer_seed";
        }
        if (!Number.isInteger(payload.amount) || payload.amount <= 0) {
          return "amount는 정수 drops 기준으로 1 이상이어야 합니다.";
        }
        return null;
      }

      async function runPreview() {
        const error = validateInput();
        if (error) return render({decision: "BLOCKED", reason: error, submit_error: error});
        const res = await fetch("/execution/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(buildPayload())
        });

        const data = await res.json();
        render(data);
      }

      async function runExecution() {
        const error = validateInput();
        if (error) return render({decision: "BLOCKED", reason: error, submit_error: error});
        const res = await fetch("/execution/request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(buildPayload())
        });

        const data = await res.json();
        render(data);
      }

      async function confirmExecution(tokenId, confirm) {
        const res = await fetch("/execution/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transient_token_id: tokenId,
            confirm: confirm,
            signer_seed: document.getElementById("signerSeedInput").value
          })
        });
        const data = await res.json();
        render(data);
      }

      function reportValue(v) {
        if (v === null || v === undefined || v === "") return "-";
        return String(v);
      }

      function buildDecisionNarrative(data) {
        if (data.decision === "APPROVED") {
          return "이 요청은 정책 한도와 목적지 검증을 통과하여 승인되었고, XRPL 테스트넷에 제출되었습니다.";
        }
        if (data.decision === "CONDITIONAL_APPROVAL") {
          return "이 요청은 일부 위험 신호가 있어 조건부 승인으로 분류되었으며, 사용자 확인 후 XRPL 테스트넷에 제출되었습니다.";
        }
        return "이 요청은 정책 위반 또는 유효하지 않은 실행 조건으로 인해 차단되었습니다. XRPL 전송은 수행되지 않았습니다.";
      }

      function buildAuditReport(data) {
        const receipt = data.audit_receipt || {};
        const txHash = receipt.tx_hash ?? data.tx_hash;
        const txDisplay = txHash ? txHash : (data.decision === "BLOCKED" ? "전송 안 됨" : "-");
        const runtimeMode = receipt.runtime_mode ?? data.runtime_mode;
        const riskFlags = receipt.risk_flags ?? data.risk_flags ?? [];
        const trustlineSource = data.xrpl_checks?.trustline_source;
        const trustlineCheck = trustlineSource === "native_xrp_no_trustline_required"
          ? "skipped (native XRP)"
          : (data.trustline_check ?? data.xrpl_checks?.trustline_check ?? "-");

        return `
          <div class="audit-panel">
            <h3>AgentGuard 감사 보고서</h3>
            <p style="color:#4b5563;">정책 판단, 실행 결과, XRPL 제출 상태, 감사 해시를 기준으로 생성된 실행 증적입니다.</p>
            <h4>1. 실행 요약</h4>
            <p><b>최종 결정:</b> ${reportValue(data.decision)}</p>
            <p><b>실행 상태:</b> ${reportValue(data.submit_status)}</p>
            <p><b>TX Hash:</b> ${reportValue(txDisplay)}</p>
            <p><b>실행 시간:</b> ${reportValue(receipt.created_at ?? data.created_at)}</p>
            <p>${buildDecisionNarrative(data)}</p>

            <h4>2. 요청 정보</h4>
            <p><b>Agent DID:</b> ${reportValue(receipt.agent_id ?? data.agent_id)}</p>
            <p><b>Signer Account:</b> ${reportValue(receipt.signer_account ?? data.signer_account)}</p>
            <p><b>Destination:</b> ${reportValue(receipt.destination ?? data.destination)}</p>
            <p><b>Amount:</b> ${reportValue(receipt.amount_drops ?? data.amount)}</p>
            <p><b>Currency:</b> ${reportValue(receipt.currency ?? data.currency ?? "XRP")}</p>
            <p><b>Purpose:</b> ${reportValue(receipt.purpose ?? data.purpose)}</p>

            <h4>3. 정책 판단 결과</h4>
            <p><b>Risk Score:</b> ${reportValue(receipt.risk_score ?? data.risk_score)}</p>
            <p><b>Risk Flags:</b> ${(riskFlags || []).join(", ") || "-"}</p>
            <p><b>Reason:</b> ${reportValue(receipt.reason ?? data.reason)}</p>
            <p><b>Decision Model 구간:</b> 0~30 APPROVED / 31~69 CONDITIONAL_APPROVAL / 70+ BLOCKED</p>

            <h4>4. XRPL 검증 결과</h4>
            <p><b>XRPL Lookup Mode:</b> ${reportValue(data.xrpl_lookup_mode ?? data.xrpl_checks?.xrpl_lookup_mode ?? runtimeMode)}</p>
            <p><b>Account Exists:</b> ${reportValue(data.account_exists ?? data.xrpl_checks?.account_exists)}</p>
            <p><b>Trustline Check:</b> ${reportValue(trustlineCheck)}</p>
            <p><b>Trustline Source:</b> ${reportValue(trustlineSource)}</p>
            <p><b>Runtime Mode:</b> ${reportValue(runtimeMode)}</p>

            <h4>5. 감사 증적</h4>
            <p><b>Receipt ID:</b> ${reportValue(receipt.receipt_id)}</p>
            <p><b>Decision ID:</b> ${reportValue(receipt.decision_id ?? data.decision_id)}</p>
            <p><b>Request Hash:</b> ${reportValue(receipt.request_hash ?? data.request_hash)}</p>
            <p><b>Policy Hash:</b> ${reportValue(receipt.policy_hash ?? data.policy_hash)}</p>
            <p><b>Audit Receipt Hash:</b> ${reportValue(data.audit_receipt_hash)}</p>
            <p><b>Created At:</b> ${reportValue(receipt.created_at)}</p>
            <p><b>Confirmed At:</b> ${reportValue(receipt.confirmed_at)}</p>

            <h4>6. 보안 주의</h4>
            <p>Seed/private key는 저장되지 않았습니다.</p>
            <p>감사 보고서는 실행 결과와 정책 판단 근거만 포함합니다.</p>
          </div>
        `;
      }

      function render(data) {
        let cls = "approved";
        let decisionMessage = "";

        if (data.decision === "BLOCKED") {
          cls = "blocked";
          decisionMessage = "정책 위반 또는 유효하지 않은 실행 요청으로 인해 차단되었습니다.";
          if (data.reason === "signer_not_bound_to_did") {
            decisionMessage = "입력된 signer seed에서 파생된 XRPL 계정은 유효하지만, 해당 Agent DID에 허용된 실행 계정으로 등록되어 있지 않습니다. configs/did_binding.yaml의 allowed_accounts를 확인하세요.";
          }
        }

        if (data.decision === "CONDITIONAL_APPROVAL") {
          cls = "review";
          decisionMessage = "해당 주소는 유효한 XRPL 계정이지만 사전 승인된 whitelist에는 포함되어 있지 않습니다. 사용자 확인 후 실행할 수 있습니다.";
        }
        if (data.decision === "APPROVED" && data.submit_status === "MOCK") {
          decisionMessage = "정책상 승인되었지만 현재 MOCK 모드이므로 테스트넷에 제출하지 않았습니다.";
        }
        if (data.did_binding_check === false && data.strict_binding_required === false) {
          decisionMessage = "Signer account는 현재 DID binding registry에 등록되어 있지 않지만, 현재 정책은 strict binding을 요구하지 않으므로 DID 정책 평가를 계속 진행했습니다.";
        }

        const trustlineSource = data.xrpl_checks?.trustline_source;
        const trustlineDisplay = trustlineSource === "native_xrp_no_trustline_required"
          ? "skipped (native XRP)"
          : (data.trustline_check ?? "-");

        const confirmPanel = data.decision === "CONDITIONAL_APPROVAL" && data.submit_status === "PENDING_CONFIRMATION" && data.transient_token_id
          ? `<div style="margin: 16px 0; padding: 12px; border: 1px solid #f59e0b; border-radius: 8px;">
              <p><b>조건부 승인 대상입니다. 위험 플래그를 확인했습니다. 실행하시겠습니까?</b></p>
              <button onclick="confirmExecution('${data.transient_token_id}', true)">Confirm Execution</button>
              <button onclick="confirmExecution('${data.transient_token_id}', false)" style="background:#6b7280;">Cancel</button>
            </div>`
          : "";
        const showAuditToggle = ["APPROVED", "CONDITIONAL_APPROVAL", "BLOCKED"].includes(data.decision);
        document.getElementById("result").innerHTML = `
          <h2 class="${cls}">${data.decision}</h2>
          ${decisionMessage ? `<p><b>안내:</b> ${decisionMessage}</p>` : ""}
          ${confirmPanel}

          <p><b>Risk Score:</b> ${data.risk_score ?? "-"}</p>
          <p><b>Risk Flags:</b> ${(data.risk_flags || []).join(", ") || "-"}</p>
          <p><b>Reason:</b> ${data.reason ?? "-"}</p>
          <p><b>Policy Explanation:</b> ${data.execution_explanation ?? "-"}</p>
          <p><b>Policy ID:</b> ${data.policy_id ?? "-"}</p>
          <p><b>Policy Version:</b> ${data.policy_version ?? "-"}</p>
          <p><b>Policy Source:</b> ${data.policy_source ?? "-"}</p>
          <p><b>Max Amount:</b> ${data.applied_limits?.max_amount_drops ?? "-"}</p>
          <p><b>Daily Limit:</b> ${data.applied_limits?.daily_limit_drops ?? "-"}</p>
          <p><b>Trustline Check:</b> ${trustlineDisplay}</p>
          <p><b>XRPL Lookup Mode:</b> ${data.xrpl_lookup_mode ?? data.xrpl_checks?.xrpl_lookup_mode ?? "-"}</p>
          <p><b>Decision Reason:</b> ${data.reason ?? "-"}</p>
          <p><b>Submit Status:</b> ${data.submit_status ?? "-"}</p>
          <p><b>Submit Error:</b> ${data.submit_error ?? "-"}</p>
          <p><b>Derived From DID:</b> ${data.derived_from_did ?? "-"}</p>
          <p><b>Signer Account:</b> ${data.signer_account ?? "-"}</p>
          <p><b>DID Binding Check:</b> ${data.did_binding_check ?? "-"}</p>
          <p><b>Allowed Accounts For DID:</b> ${(data.allowed_accounts || []).length ? "<br>- " + data.allowed_accounts.join("<br>- ") : "-"}</p>
          <p><b>TX Hash:</b> ${data.tx_hash ?? "-"}</p>
          <p><b>TX Hash Reason:</b> ${data.tx_hash_reason ?? "-"}</p>
          <p><b>Runtime Mode:</b> ${data.runtime_mode ?? "-"}</p>
          <p><b>Decision ID:</b> ${data.decision_id ?? "-"}</p>
          <p><b>Policy Hash:</b> ${data.policy_hash ?? "-"}</p>
          <p><b>Request Hash:</b> ${data.request_hash ?? "-"}</p>
          <p><b>Token ID:</b> ${data.transient_token_id ?? data.token_id ?? "-"}</p>
          <p><b>Token Expiration:</b> ${data.token_expires_at ?? "-"}</p>
          <p><b>Replay Protection:</b> ${JSON.stringify(data.replay_protection ?? {})}</p>
          <p><b>XRPL Memo Anchored:</b> ${data.policy_hash ? "yes" : "-"}</p>
          <h3>Audit Evidence</h3>
          <p><b>Receipt ID:</b> ${data.audit_receipt?.receipt_id ?? "-"}</p>
          <p><b>Decision ID:</b> ${data.audit_receipt?.decision_id ?? data.decision_id ?? "-"}</p>
          <p><b>Request Hash:</b> ${data.audit_receipt?.request_hash ?? data.request_hash ?? "-"}</p>
          <p><b>Policy Hash:</b> ${data.audit_receipt?.policy_hash ?? data.policy_hash ?? "-"}</p>
          <p><b>Audit Receipt Hash:</b> ${data.audit_receipt_hash ?? "-"}</p>
          <p><b>Confirmed At:</b> ${data.audit_receipt?.confirmed_at ?? "-"}</p>
          <p><b>TX Hash:</b> ${data.audit_receipt?.tx_hash ?? data.tx_hash ?? "-"}</p>

          ${showAuditToggle ? `<button class="audit-toggle" onclick="toggleAuditReport()">감사 보고서 보기</button>` : ""}
          <div id="auditReportContainer" style="display:none;"></div>

          <h3>Raw JSON (seed redacted)</h3>
          <pre>${JSON.stringify({ ...data, signer_seed: undefined, private_key: undefined, secret: undefined, mnemonic: undefined }, null, 2)}</pre>
        `;
        window.__auditData = data;
      }

      function toggleAuditReport() {
        const container = document.getElementById("auditReportContainer");
        if (!container) return;
        if (container.style.display === "none") {
          container.innerHTML = buildAuditReport(window.__auditData || {});
          container.style.display = "block";
          return;
        }
        container.style.display = "none";
      }
      </script>
    </body>
    </html>
    """
