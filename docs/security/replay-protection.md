# Replay Protection

## replay attack 정의

정상 요청에서 발급된 토큰/파라미터를 재사용해 동일 실행을 반복 유도하는 공격이다.

## 방어 원칙

- 같은 token 재사용 차단
- duplicate nonce 차단
- expired token 차단

## 운영 포인트

실행 게이트웨이는 제출 시점마다 토큰 상태(사용 여부/만료 여부)와 nonce 중복 여부를 함께 검증해야 한다.
