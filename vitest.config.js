import { defineConfig } from 'vitest/config';

// PM 007 D5 — Vitest + happy-dom 에서 EstreUV component lifecycle · reactive property 검증.
// EstreUI bridge 활성 시나리오 (실 EstreUI article 부착) 는 happy-dom 검증 보류 — 그건 estreuv-integration-app/ 의
// 실 브라우저 (Antigravity 핸드오프) 에서. 여기선 EstreUV 자체 단위 검증.
export default defineConfig({
    test: {
        environment: 'happy-dom',
        include: ['test/**/*.test.js'],
        globals: false,
    },
});
