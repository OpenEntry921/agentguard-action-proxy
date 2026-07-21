# AgentGuard Input & Data Control Demo

규칙 기반 Input Control MVP 및 세일즈 데모입니다. 기존 AgentGuard Runtime 앞단에 위치할 수 있는 독립 사전 통제 계층으로, 이번 데모에서는 Runtime과 직접 연결하지 않습니다.

## 기능
- 프롬프트 인젝션 및 민감정보 탐지
- `.txt`, `.pdf`, `.docx` 파일 텍스트/메타데이터 분석
- 정책 기반 `ALLOW`, `MASK`, `REVIEW`, `BLOCK` 결정
- 원문을 영구 저장하지 않는 마스킹 결과 및 감사 증적 생성
- `http://127.0.0.1:8100/demo` 단일 HTML 데모 UI

## 실행
```bash
npm install
npm run typecheck
npm test
npm run build
npm start
```

## 제한사항
이 데모는 결정론적 규칙 기반 MVP입니다. 완전한 DLP, 모든 프롬프트 인젝션 탐지, 모든 개인정보 유출 방지, 모든 문서 이해를 보장하지 않습니다.
