// API 요청파일
const API_BASE_URL = "http://localhost:8090/app/member";

export const signup = async (memberId, memberPasswd) => {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, memberPasswd }),
  });

  if (!response.ok) throw new Error("회원가입 실패!");
  return response.json();
};

export const login = async (memberId, memberPasswd) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberId, memberPasswd }),
    credentials: "include", // 세션 기반 인증 시 필요
  });

  if (!response.ok) throw new Error("로그인 실패!");
  return response.json();
};

export const logout = async () => {
  await fetch(`${API_BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  localStorage.removeItem("user");
};
