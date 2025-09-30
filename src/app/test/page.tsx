import { supabase } from "@/lib/supabaseClient";

export default async function TestPage() {
  // 단순 연결 테스트: DB 버전 정보 확인
  const { data, error } = await supabase.from("todos").select("*").limit(1);

  return (
    <main>
      <h1>Supabase 연결 테스트</h1>
      {error && <p style={{ color: "red" }}>❌ 연결 실패: {error.message}</p>}
      {!error && data && (
        <p>✅ 연결 성공! 데이터 예시: {JSON.stringify(data[0] || {})}</p>
      )}
    </main>
  );
}
