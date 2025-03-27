// LoginModal.js
import Login from "../components/Login"; // 로그인 컴포넌트

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
          로그인
        </h2>
        <Login />
        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          계정이 없나요?
          <a href="/signup" className="text-blue-500 hover:underline ml-1">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
